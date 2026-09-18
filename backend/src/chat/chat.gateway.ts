import { IncomingMessage } from "node:http";
import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { and, eq } from "drizzle-orm";
import { type AuthUser, type CreateRoomValues, createRoomSchema } from "shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard";
import { DatabaseService } from "src/db/database.service";
import { sessions } from "src/db/schema";
import { WebSocket } from "ws";
import { ChatService } from "./chat.service";
import { WsService } from "./ws.service";

@WebSocketGateway({ path: "/ws" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
    private wsService: WsService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: WebSocket, req: IncomingMessage) {
    try {
      const token = req.headers.cookie ?? "";
      const match = token.match(/access_token=([^;]+)/);
      if (!match) throw new Error("No token");
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
        sessionId: number;
      }>(match[1]);

      const [session] = await this.databaseService.db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, payload.sub),
            eq(sessions.id, payload.sessionId),
          ),
        );
      if (!session) throw new Error("Invalid session");

      client.user = {
        id: payload.sub,
        username: payload.username,
        sessionId: payload.sessionId,
      };
      this.wsService.addClient(client);
    } catch {
      client.close(4001, "Unauthorized");
    }
  }

  handleDisconnect(client: WebSocket) {
    this.wsService.removeClient(client);
  }

  @SubscribeMessage("message:send")
  @UseGuards(WsJwtGuard)
  async handleMessage(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: {
      roomId: number;
      content: string;
      clientMessageId: string;
      ackId: string;
    },
    @CurrentUser() user: AuthUser,
  ) {
    try {
      const { roomId, content, clientMessageId } = data;
      const result = await this.chatService.sendMessage(user.id, {
        roomId,
        content,
        clientMessageId,
      });
      if (result.status === "ok") {
        this.wsService.handleSendMessage(data.roomId, {
          event: "message:new",
          data: result.message,
          ackId: data.ackId,
        });
      } else {
        client.send(
          JSON.stringify({
            event: "ack",
            data: {
              ackId: data.ackId,
              status: "error",
              message: result.message,
            },
          }),
        );
      }
    } catch {
      client.send(
        JSON.stringify({
          event: "ack",
          data: {
            ackId: null,
            status: "error",
            message: "Failed to process message",
          },
        }),
      );
    }
  }

  @SubscribeMessage("room:create")
  @UseGuards(WsJwtGuard)
  async handleRoomCreate(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: CreateRoomValues & { ackId: string },
    @CurrentUser() user: AuthUser,
  ) {
    try {
      const parsed = createRoomSchema.safeParse(data);
      if (!parsed.success) {
        client.send(
          JSON.stringify({
            event: "ack",
            data: {
              ackId: data.ackId,
              status: "error",
              message: "Validation failed",
              errors: parsed.error.issues,
            },
          }),
        );
        return;
      }
      const { isPrivate, members, name, type } = data;
      const result = await this.chatService.createRoom(user.id, {
        isPrivate,
        members,
        name,
        type,
      });
      if (result.status === "ok") {
        this.wsService.handleRoomCreate({
          event: "room:created",
          data: result.populatedRoom,
          ackId: data.ackId,
        });
      } else {
        client.send(
          JSON.stringify({
            event: "ack",
            data: { ackId: null, status: "error", message: result.message },
          }),
        );
      }
    } catch (error) {
      console.error("Create room failed: ", error);
      client.send(
        JSON.stringify({
          event: "ack",
          data: {
            ackId: null,
            status: "error",
            message: "Failed to create room",
          },
        }),
      );
    }
  }

  @SubscribeMessage("room:join")
  @UseGuards(WsJwtGuard)
  async handleRoomJoin(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: { roomId: number; ackId: string },
    @CurrentUser() user: AuthUser,
  ) {
    try {
      const result = await this.chatService.joinRoom(user.id, data.roomId);
      if (result.status === "ok") {
        this.wsService.handleRoomJoin({
          event: "room:joined",
          data: result.populatedRoom,
          ackId: data.ackId,
        });
      } else {
        client.send(
          JSON.stringify({
            event: "ack",
            data: {
              ackId: data.ackId,
              status: "error",
              message: result.message,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Join room failed: ", error);
      client.send(
        JSON.stringify({
          event: "ack",
          data: {
            ackId: null,
            status: "error",
            message: "Failed to join room",
          },
        }),
      );
    }
  }
}
