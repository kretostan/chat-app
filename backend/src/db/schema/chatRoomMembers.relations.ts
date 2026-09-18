import { relations } from "drizzle-orm";
import { chatRoomMembers } from "./chatRoomMembers.schema";
import { chatRooms } from "./chatRooms.schema";
import { users } from "./users.schema";

export const chatRoomsMembersRelations = relations(
  chatRoomMembers,
  ({ one }) => ({
    user: one(users, {
      fields: [chatRoomMembers.userId],
      references: [users.id],
    }),
    chatRooms: one(chatRooms, {
      fields: [chatRoomMembers.chatRoomId],
      references: [chatRooms.id],
    }),
  }),
);
