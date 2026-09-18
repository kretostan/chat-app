import { z } from "zod";

export const sessionSchema = z.object({
  id: z.number(),
  userId: z.number(),
  deviceName: z.string(),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime(),
  sessionUuid: z.string().nullable(),
});

export type SessionInfo = z.infer<typeof sessionSchema>;
