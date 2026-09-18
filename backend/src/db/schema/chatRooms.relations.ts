import { relations } from "drizzle-orm";
import { chatRoomMembers } from "./chatRoomMembers.schema";
import { chatRooms } from "./chatRooms.schema";
import { messages } from "./messages.schema";

export const chatRoomsRelations = relations(chatRooms, ({ many }) => ({
  members: many(chatRoomMembers),
  messages: many(messages),
}));
