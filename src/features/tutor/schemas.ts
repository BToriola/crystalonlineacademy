import { z } from "zod";

export const logSessionSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["completed", "missed", "cancelled"]),
  topic: z.string().trim().max(200),
  notes: z.string().trim().max(4000),
  homework: z.string().trim().max(1000),
});

export type LogSessionInput = z.infer<typeof logSessionSchema>;

export const awardStarsSchema = z.object({
  studentId: z.string().min(1),
  amount: z.number().int().min(1).max(5),
  reason: z.string().trim().min(3, "Tell them what they did brilliantly").max(140),
});

export type AwardStarsInput = z.infer<typeof awardStarsSchema>;
