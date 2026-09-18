import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.schema";

export const chatRooms = sqliteTable("chat_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  type: text({ enum: ["dm", "group"] })
    .notNull()
    .default("dm"),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  lastMessageAt: text("last_message_at"),
  creatorId: integer("creator_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const insertChatRoomSchema = createInsertSchema(chatRooms);
export const selectChatRoomSchema = createSelectSchema(chatRooms);
