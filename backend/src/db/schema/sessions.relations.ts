import { relations } from "drizzle-orm";
import { sessions } from "./sessions.schema";
import { users } from "./users.schema";

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
