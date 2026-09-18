import { Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import {
  CreateRoomResult,
  CreateRoomValues,
  createRoomSchema,
  PaginatedMessages,
  PaginatedRooms,
} from "shared";
import { DatabaseService } from "src/db/database.service";
import { chatRoomMembers, chatRooms, messages, users } from "src/db/schema";

@Injectable()
export class ChatService {
  constructor(private readonly databaseService: DatabaseService) {}

  async loadRooms(
    userId: number,
    cursor?: string,
    limit: number = 30,
  ): Promise<PaginatedRooms> {
    const joinedAtSubquery = sql<string>`
      SELECT ${chatRoomMembers.joinedAt}
      FROM ${chatRoomMembers}
      WHERE ${chatRoomMembers.chatRoomId} = ${chatRooms.id}
      AND ${chatRoomMembers.userId} = ${userId}
    `;

    const sortKey = sql<string>`COALESCE(${chatRooms.lastMessageAt}, ${joinedAtSubquery})`;

    const conditions = [
      inArray(
        chatRooms.id,
        this.databaseService.db
          .select({ id: chatRoomMembers.chatRoomId })
          .from(chatRoomMembers)
          .where(eq(chatRoomMembers.userId, userId)),
      ),
    ];

    if (cursor) {
      const [cursorTimestamp, cursorId] = cursor.split("|");
      conditions.push(
        sql`${sortKey} < ${cursorTimestamp} OR ${sortKey} = ${cursorTimestamp} AND ${chatRooms.id} < ${+cursorId}`,
      );
    }

    const roomsWithData =
      await this.databaseService.db.query.chatRooms.findMany({
        where: and(...conditions),
        limit: limit + 1,
        with: {
          members: {
            with: {
              user: {
                columns: {
                  passwordHash: false,
                  email: false,
                  createdAt: false,
                },
              },
            },
          },
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
            columns: { chatRoomId: false, clientMessageId: false },
          },
        },
      });

    const hasMore = roomsWithData.length > limit;
    const items = hasMore ? roomsWithData.slice(0, limit) : roomsWithData;

    const rooms = roomsWithData.map(
      ({ members, messages: [lastMessage], ...room }) => ({
        ...room,
        members: members.map((member) => ({
          ...member.user,
          joinedAt: member.joinedAt,
        })),
        lastMessage: lastMessage ?? null,
      }),
    );

    const nextCursor = hasMore
      ? (() => {
          const last = items[items.length - 1];
          const userMember = last.members.find(
            (member) => member.userId === userId,
          );
          const sortValue =
            last.lastMessageAt ?? userMember?.joinedAt ?? last.createdAt;
          return `${sortValue}|${last.id}`;
        })()
      : null;
    return { rooms, hasMore, cursor: nextCursor };
  }

  async loadRoomDetails(roomId: number, userId: number) {
    const room = await this.databaseService.db.query.chatRooms.findFirst({
      where: and(
        eq(chatRooms.id, roomId),
        inArray(
          chatRooms.id,
          this.databaseService.db
            .select({
              id: chatRoomMembers.chatRoomId,
            })
            .from(chatRoomMembers)
            .where(eq(chatRoomMembers.userId, userId)),
        ),
      ),
      columns: { lastMessageAt: false, createdAt: false },
      with: {
        members: {
          with: {
            user: {
              columns: { passwordHash: false, createdAt: false, email: false },
            },
          },
        },
      },
    });

    if (!room) throw new NotFoundException();

    return {
      ...room,
      members: room.members.map((member) => ({
        ...member.user,
        joinedAt: member.joinedAt,
      })),
    };
  }

  async loadMessages(
    roomdId: number,
    userId: number,
    cursor?: number,
    limit: number = 50,
  ): Promise<PaginatedMessages> {
    const [isMember] = await this.databaseService.db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.userId, userId),
          eq(chatRoomMembers.chatRoomId, roomdId),
        ),
      );

    if (!isMember) throw new NotFoundException();

    const results = await this.databaseService.db
      .select()
      .from(messages)
      .where(
        and(
          cursor ? lt(messages.id, cursor) : undefined,
          eq(messages.chatRoomId, roomdId),
        ),
      )
      .orderBy(desc(messages.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { messages: items, hasMore, cursor: nextCursor };
  }

  async sendMessage(
    userId: number,
    data: { roomId: number; content: string; clientMessageId: string },
  ) {
    const [member] = await this.databaseService.db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.userId, userId),
          eq(chatRoomMembers.chatRoomId, data.roomId),
        ),
      );
    if (!member) return { status: "error" as const, message: "Not a member" };

    try {
      const [message] = await this.databaseService.db
        .insert(messages)
        .values({
          content: data.content,
          userId,
          chatRoomId: data.roomId,
          clientMessageId: data.clientMessageId,
        })
        .returning();

      await this.databaseService.db
        .update(chatRooms)
        .set({ lastMessageAt: sql`datetime('now')` })
        .where(eq(chatRooms.id, data.roomId));

      return { status: "ok", message };
    } catch (error) {
      if (error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
        const [existing] = await this.databaseService.db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.userId, userId),
              eq(messages.clientMessageId, data.clientMessageId),
            ),
          );
        return { status: "ok", message: existing };
      }
      throw error;
    }
  }

  async createRoom(
    userId: number,
    data: CreateRoomValues,
  ): Promise<CreateRoomResult> {
    const validatedData = createRoomSchema.parse(data);

    if (validatedData.members.length < 2)
      return {
        status: "error" as const,
        message: "Chat members don't exist",
      };

    const existingUsers = await this.databaseService.db
      .select()
      .from(users)
      .where(inArray(users.id, validatedData.members));

    const existingIds = new Set(existingUsers.map((user) => user.id));
    const nonExisting = validatedData.members.filter(
      (id) => !existingIds.has(id),
    );

    if (nonExisting.length > 0)
      return { status: "error" as const, message: "Some users not found" };

    const [{ roomId }] = await this.databaseService.db
      .insert(chatRooms)
      .values({
        creatorId: userId,
        name: validatedData.name,
        type: validatedData.type,
        isPrivate: validatedData.isPrivate,
      })
      .returning({ roomId: chatRooms.id });

    await this.databaseService.db.insert(chatRoomMembers).values(
      validatedData.members.map((memberId) => ({
        chatRoomId: roomId,
        userId: memberId,
      })),
    );

    const populatedRoom = await this.loadRoomDetails(roomId, userId);
    return { status: "ok", populatedRoom };
  }

  async joinRoom(userId: number, roomId: number): Promise<CreateRoomResult> {
    const [member] = await this.databaseService.db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.userId, userId),
          eq(chatRoomMembers.chatRoomId, roomId),
        ),
      );

    if (member) return { status: "error", message: "User already in room" };

    const [newMember] = await this.databaseService.db
      .insert(chatRoomMembers)
      .values({
        chatRoomId: roomId,
        userId,
      })
      .returning();

    const room = await this.loadRoomDetails(roomId, newMember.id);
    return { status: "ok" as const, populatedRoom: room };
  }
}
