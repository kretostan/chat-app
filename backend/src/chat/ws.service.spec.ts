import { Test, TestingModule } from "@nestjs/testing";
import { ChatRoomDetails } from "shared";
import { WebSocket } from "ws";
import { DatabaseService } from "../db/database.service";
import { WsService } from "./ws.service";

const createMockSocket = (id: number) =>
  ({
    readyState: WebSocket.OPEN,
    send: jest.fn(),
    close: jest.fn(),
    user: { id, username: `user${id}`, sessionId: 1 },
  }) as unknown as WebSocket;

// --- Helper functions to build Drizzle Query Builder mocks ---

/**
 * Builds a mock that resolves to members for db.select().from().where() chain.
 */
const mockDbSuccess = (service: WsService, userIds: number[]) => {
  jest
    .spyOn(service["databaseService"].db as never, "select")
    .mockReturnValueOnce({
      from: jest.fn().mockReturnValueOnce({
        where: jest
          .fn()
          .mockResolvedValue(userIds.map((id) => ({ userId: id }))),
      }),
    } as never);
};

const mockDbEmpty = (service: WsService) => {
  jest
    .spyOn(service["databaseService"].db as never, "select")
    .mockReturnValueOnce({
      from: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockResolvedValue([]),
      }),
    } as never);
};

const mockDbError = (service: WsService, message = "DB query failed") => {
  jest
    .spyOn(service["databaseService"].db as never, "select")
    .mockReturnValueOnce({
      from: jest.fn().mockReturnValueOnce({
        where: jest.fn().mockRejectedValue(new Error(message)),
      }),
    } as never);
};

// --- Tests --------------------------------------------------------------------

describe("WsService", () => {
  let service: WsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              select: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WsService>(WsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addClient", () => {
    it("should add a new socket for an existing user", () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      expect(service["userSockets"].has(1)).toBe(true);
      expect(service["socketUsers"].get(s1)).toBe(1);
      expect(service["userSockets"].get(1).size).toBe(1);
    });

    it("should add multiple sockets for the same user (multiple sessions)", () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(1);
      service.addClient(s1);
      service.addClient(s2);

      expect(service["userSockets"].get(1).size).toBe(2);
    });

    it("should separate different users", () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(2);
      service.addClient(s1);
      service.addClient(s2);

      expect(service["userSockets"].get(1).size).toBe(1);
      expect(service["userSockets"].get(2).size).toBe(1);
    });
  });

  describe("removeClient", () => {
    it("should remove one socket for a user with multiple sockets", () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(1);
      service.addClient(s1);
      service.addClient(s2);

      expect(service["userSockets"].get(1).size).toBe(2);

      service.removeClient(s1);

      expect(service["userSockets"].get(1).size).toBe(1);
      expect([...service["userSockets"].get(1)]).not.toContain(s1);
    });

    it("should remove the user entirely when last socket disconnects", () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      service.removeClient(s1);

      expect(service["userSockets"].has(1)).toBe(false);
    });

    it("should do nothing for a socket not in the map", () => {
      const s1 = createMockSocket(1);
      expect(() => service.removeClient(s1)).not.toThrow();
      expect(service["userSockets"].has(1)).toBe(false);
    });

    it("should remove correct user when multiple users are connected", () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(2);
      service.addClient(s1);
      service.addClient(s2);

      service.removeClient(s1);

      expect(service["userSockets"].has(1)).toBe(false);
      expect(service["userSockets"].has(2)).toBe(true);
    });
  });

  describe("handleSendMessage", () => {
    it("should broadcast to all members in the room", async () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(2);
      service.addClient(s1);
      service.addClient(s2);

      mockDbSuccess(service, [1, 2, 3]); // member 3 not connected

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          createdAt: new Date().toISOString(),
          chatRoomId: 42,
        },
        ackId: "abc-123",
      };
      await service.handleSendMessage(42, message);

      // s1 (sender) SHOULD also receive the broadcast back
      expect(s1.send).toHaveBeenCalled();

      // s2 should receive it
      expect(s2.send).toHaveBeenCalledTimes(1);
    });

    it("should send to all sockets when user has multiple active sessions", async () => {
      const s1 = createMockSocket(1);
      const s2Client = createMockSocket(1); // same user, different socket
      const s3 = createMockSocket(2);
      service.addClient(s1);
      service.addClient(s2Client);
      service.addClient(s3);

      mockDbSuccess(service, [1, 2]);

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          createdAt: new Date().toISOString(),
          chatRoomId: 42,
        },
        ackId: "abc-123",
      };
      await service.handleSendMessage(42, message);

      expect(s1.send).toHaveBeenCalled();
      expect(s2Client.send).toHaveBeenCalled();
    });

    it("should skip sockets that are not OPEN", async () => {
      const s1 = createMockSocket(1);
      const sClosing: WebSocket = createMockSocket(2) as unknown as WebSocket;

      Object.defineProperty(sClosing, "readyState", {
        value: WebSocket.CLOSING,
        writable: true,
        configurable: true,
      });

      service.addClient(s1);
      service.addClient(sClosing);

      mockDbSuccess(service, [1, 2]);

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          createdAt: new Date().toISOString(),
          chatRoomId: 42,
        },
        ackId: "abc-123",
      };
      await service.handleSendMessage(42, message);

      expect(s1.send).toHaveBeenCalled();
      expect(sClosing.send).not.toHaveBeenCalled();
    });

    it("should not throw when some members have no sockets", async () => {
      mockDbSuccess(service, [100, 200]); // none connected

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          createdAt: new Date().toISOString(),
          chatRoomId: 42,
        },
        ackId: "abc-123",
      };
      await expect(
        service.handleSendMessage(42, message),
      ).resolves.toBeUndefined();
    });

    it("should not crash when database query throws", async () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      mockDbError(service, "SQLITE_BUSY: database is locked");

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          createdAt: new Date().toISOString(),
          chatRoomId: 42,
        },
        ackId: "abc-123",
      };

      await expect(service.handleSendMessage(42, message)).rejects.toThrow(
        "SQLITE_BUSY",
      );
    });

    it("should handle member with multiple sockets and mixed readyState", async () => {
      const sOpen = createMockSocket(1);
      const sClosed: WebSocket = createMockSocket(1) as unknown as WebSocket;
      Object.defineProperty(sClosed, "readyState", {
        value: WebSocket.CLOSED,
        writable: true,
        configurable: true,
      });
      service.addClient(sOpen);
      service.addClient(sClosed);

      mockDbSuccess(service, [1]);

      const message = {
        event: "message:new",
        data: {
          id: 1,
          content: "hi",
          userId: 1,
          chatRoomId: 42,
          createdAt: new Date().toISOString(),
          clientMessageId: crypto.randomUUID(),
        },
        ackId: "abc-123",
      };
      await service.handleSendMessage(2, message);

      expect(sOpen.send).toHaveBeenCalled();
      expect(sClosed.send).not.toHaveBeenCalled();
    });
  });

  describe("handleRoomCreate", () => {
    it("should broadcast room creation to all members", async () => {
      const s1 = createMockSocket(1);
      const s2 = createMockSocket(2);
      service.addClient(s1);
      service.addClient(s2);

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: "My Room",
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 1,
            username: "user1",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 2,
            username: "user2",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
        ],
        lastMessage: null,
      };

      mockDbSuccess(service, [1, 2]);

      await service.handleRoomCreate({
        event: "room:created",
        data: mockRoom,
        ackId: "abc-123",
      });

      // creator also receives room:created broadcast
      expect(s1.send).toHaveBeenCalled();

      // member s2 receives room data
      expect(s2.send).toHaveBeenCalledTimes(1);
    });

    it("should not broadcast to members without sockets", async () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: "My Room",
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 1,
            username: "user1",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
          {
            id: 3,
            username: "user3",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
        ],
        lastMessage: null,
      };

      mockDbSuccess(service, [1, 3]);

      await service.handleRoomCreate({
        event: "room:created",
        data: mockRoom,
        ackId: "abc-123",
      });

      expect(s1.send).toHaveBeenCalled();
    });

    it("should handle empty member list gracefully", async () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: null,
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [],
        lastMessage: null,
      };

      mockDbEmpty(service);

      await expect(
        service.handleRoomCreate({
          event: "room:created",
          data: mockRoom,
          ackId: "abc-123",
        }),
      ).resolves.toBeUndefined();
    });

    it("should not crash when database query throws", async () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: "My Room",
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [
          {
            id: 1,
            username: "user1",
            avatarUrl: null,
            joinedAt: new Date().toISOString(),
          },
        ],
        lastMessage: null,
      };

      mockDbError(service, "database timeout");

      await expect(
        service.handleRoomCreate({
          event: "room:created",
          data: mockRoom,
          ackId: "abc-123",
        }),
      ).rejects.toThrow("timeout");
    });
  });

  describe("handleRoomJoin", () => {
    it("should broadcast to all members of the room", async () => {
      const s1 = createMockSocket(1);
      service.addClient(s1);

      mockDbSuccess(service, [1]);

      const mockRoom: ChatRoomDetails = {
        id: 42,
        name: null,
        type: "dm",
        isPrivate: true,
        createdAt: new Date().toISOString(),
        members: [],
        lastMessage: null,
      };

      await service.handleRoomJoin({
        event: "room:joined",
        data: mockRoom,
        ackId: "abc-123",
      });

      expect(s1.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: "room:joined",
          data: mockRoom,
          ackId: "abc-123",
        }),
      );
    });

    it("should not throw if user has no socket connections", async () => {
      mockDbSuccess(service, [999]);

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: null,
        type: "dm",
        isPrivate: false,
        createdAt: new Date().toISOString(),
        members: [],
        lastMessage: null,
      };

      await expect(
        service.handleRoomJoin({
          event: "room:joined",
          data: mockRoom,
          ackId: "abc-123",
        }),
      ).resolves.toBeUndefined();
    });

    it("should not crash when database query throws", async () => {
      mockDbError(service, "SQLITE_BUSY");

      const mockRoom: ChatRoomDetails = {
        id: 99,
        name: null,
        type: "dm",
        isPrivate: false,
        createdAt: new Date().toISOString(),
        members: [],
        lastMessage: null,
      };

      await expect(
        service.handleRoomJoin({
          event: "room:joined",
          data: mockRoom,
          ackId: "abc-123",
        }),
      ).rejects.toThrow("SQLITE_BUSY");
    });
  });
});
