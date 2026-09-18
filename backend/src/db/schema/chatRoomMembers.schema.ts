import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { chatRooms } from "./chatRooms.schema";
import { users } from "./users.schema";

export const chatRoomMembers = sqliteTable(
  "chat_room_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chatRoomId: integer("chat_room_id")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    joinedAt: text("joined_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex("uq_chat_room_members").on(table.userId, table.chatRoomId),
  ],
);

export const insertChatRoomMembers = createInsertSchema(chatRoomMembers);
export const selectChatRoomMembers = createSelectSchema(chatRoomMembers);
