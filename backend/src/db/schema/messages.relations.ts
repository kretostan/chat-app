import { relations } from "drizzle-orm";
import { chatRooms } from "./chatRooms.schema";
import { messages } from "./messages.schema";
import { users } from "./users.schema";

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  chatRoom: one(chatRooms, {
    fields: [messages.chatRoomId],
    references: [chatRooms.id],
  }),
}));
