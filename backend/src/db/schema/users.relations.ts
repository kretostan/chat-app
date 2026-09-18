import { relations } from "drizzle-orm";
import { chatRoomMembers } from "./chatRoomMembers.schema";
import { messages } from "./messages.schema";
import { sessions } from "./sessions.schema";
import { users } from "./users.schema";

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  messages: many(messages),
  chatRoomMembers: many(chatRoomMembers),
}));
