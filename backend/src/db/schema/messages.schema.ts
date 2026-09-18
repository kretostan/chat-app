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

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    content: text("content").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chatRoomId: integer("chat_room_id")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    clientMessageId: text("client_message_id"),
  },
  (table) => [
    uniqueIndex("uq_client_message_id").on(table.userId, table.clientMessageId),
  ],
);

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
