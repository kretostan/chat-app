import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.schema";

export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceName: text("device_name"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    lastUsedAt: text("last_used_at").notNull(),
    sessionUuid: text("session_uuid"),
  },
  (table) => [
    uniqueIndex("uq_user_session_uuid").on(table.userId, table.sessionUuid),
  ],
);

export const insertSessionsSchema = createInsertSchema(sessions);
export const selectSessionsSchema = createSelectSchema(sessions);
