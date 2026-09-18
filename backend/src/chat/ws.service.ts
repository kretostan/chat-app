import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { BroadcastMessage, ChatRoomDetails } from "shared";
import { DatabaseService } from "src/db/database.service";
import { chatRoomMembers } from "src/db/schema";
import { WebSocket } from "ws";

@Injectable()
export class WsService {
  private userSockets = new Map<number, Set<WebSocket>>();
  private socketUsers = new Map<WebSocket, number>();

  constructor(private databaseService: DatabaseService) {}

  addClient(ws: WebSocket) {
    const userId = ws.user.id;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(ws);
    this.socketUsers.set(ws, userId);
  }

  removeClient(ws: WebSocket) {
    const userId = this.socketUsers.get(ws);
    if (!userId) return;

    const userSocketsSet = this.userSockets.get(userId);
    if (userSocketsSet) {
      userSocketsSet.delete(ws);
      if (userSocketsSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  async handleSendMessage(
    roomId: number,
    message: { event: string; data: BroadcastMessage; ackId: string },
  ) {
    const members = await this.databaseService.db
      .select({
        userId: chatRoomMembers.userId,
      })
      .from(chatRoomMembers)
      .where(eq(chatRoomMembers.chatRoomId, roomId));

    const str = JSON.stringify(message);
    for (const member of members) {
      const sockets = this.userSockets.get(member.userId);
      if (!sockets) continue;

      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) ws.send(str);
      }
    }
  }

  async handleRoomCreate(room: {
    event: string;
    data: Omit<ChatRoomDetails, "createdAt" | "joinedAt">;
    ackId: string;
  }) {
    const members = await this.databaseService.db
      .select({ userId: chatRoomMembers.userId })
      .from(chatRoomMembers)
      .where(eq(chatRoomMembers.chatRoomId, room.data.id));

    const str = JSON.stringify(room);
    for (const member of members) {
      const sockets = this.userSockets.get(member.userId);

      if (!sockets) continue;
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) ws.send(str);
      }
    }
  }

  async handleRoomJoin(room: {
    event: string;
    data: Omit<ChatRoomDetails, "createdAt" | "joinedAt">;
    ackId: string;
  }) {
    const members = await this.databaseService.db
      .select({
        userId: chatRoomMembers.userId,
      })
      .from(chatRoomMembers)
      .where(eq(chatRoomMembers.chatRoomId, room.data.id));

    const str = JSON.stringify(room);
    for (const member of members) {
      const sockets = this.userSockets.get(member.userId);

      if (!sockets) continue;

      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) ws.send(str);
      }
    }
  }
}
