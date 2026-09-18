import { Test, TestingModule } from "@nestjs/testing";
import { BroadcastMessage, ChatRoomDetails } from "shared";
import { WsService } from "src/chat/ws.service";
import { DatabaseService } from "src/db/database.service";
import { WebSocket } from "ws";

describe("WsService e2e tests", () => {
  let wsService: WsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              select: jest.fn(),
              query: jest.fn(),
              insert: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    wsService = module.get<WsService>(WsService);
  });

  describe("handleSendMessage broadcasting", () => {
    it("should deliver message to all room members excluding sender", async () => {
      const sockA = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;
      const sockB = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;

      wsService["userSockets"].set(42, new Set<WebSocket>([sockA]));
      wsService["userSockets"].set(43, new Set([sockB]));
      wsService["socketUsers"].set(sockA, 42);
      wsService["socketUsers"].set(sockB, 43);

      const dbSelectMock = jest.spyOn(
        wsService["databaseService"].db,
        "select",
      ) as any;
      dbSelectMock.mockReturnValueOnce({
        from: () => ({
          where: async () => [{ userId: 42 }, { userId: 43 }],
        }),
      });

      const broadcastPayload = {
        id: 10,
        content: "test chat",
        userId: 42,
        createdAt: new Date().toISOString(),
        chatRoomId: 99,
      };
      await wsService.handleSendMessage(
        99,
        {
          event: "message:new",
          data: broadcastPayload as unknown as BroadcastMessage,
        },
        sockA,
      );

      expect(sockA.send).toHaveBeenCalled();
      expect(sockB.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "message:new", data: broadcastPayload }),
      );
    });

    it("should broadcast to all members of a created room", async () => {
      const mockSock = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;
      const sock2 = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;

      wsService["userSockets"].set(42, new Set<WebSocket>([mockSock]));
      wsService["userSockets"].set(43, new Set([sock2]));

      const dbSelectMock = jest.spyOn(
        wsService["databaseService"].db,
        "select",
      ) as any;
      dbSelectMock.mockReturnValueOnce({
        from: () => ({
          where: async () => [{ userId: 42 }, { userId: 43 }],
        }),
      });

      const roomData: ChatRoomDetails = {
        id: 99,
        name: "Test Room",
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 42,
            username: "user1",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 43,
            username: "user2",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
        ],
        lastMessage: null,
      };

      await wsService.handleRoomCreate(roomData as any, mockSock);

      expect(mockSock.send).toHaveBeenCalled();
      expect(sock2.send).toHaveBeenCalled();
    });

    it("should handle user with multiple active sockets in the same room", async () => {
      const sockA = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;
      const sockB = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      } as unknown as WebSocket;

      wsService["userSockets"].set(42, new Set<WebSocket>([sockA, sockB]));

      const dbSelectMock = jest.spyOn(
        wsService["databaseService"].db,
        "select",
      ) as any;
      dbSelectMock.mockReturnValueOnce({
        from: () => ({
          where: async () => [{ userId: 42 }],
        }),
      });

      const broadcastPayload = {
        id: 10,
        content: "broadcast",
        userId: 42,
        createdAt: new Date().toISOString(),
        chatRoomId: 99,
      };
      await wsService.handleSendMessage(99, {
        event: "message:new",
        data: broadcastPayload as unknown as BroadcastMessage,
      });

      expect(sockA.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "message:new", data: broadcastPayload }),
      );
      expect(sockB.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "message:new", data: broadcastPayload }),
      );
    });
  });
});
