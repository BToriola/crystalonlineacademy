import { z } from "zod";
import { MEET_URL_PATTERN } from "@/features/attendance/constants";

export const leadStatuses = ["new", "contacted", "trial_booked", "converted", "closed"] as const;
export const applicationStatuses = ["new", "screening", "interview", "demo", "approved", "rejected"] as const;
export const assignmentStatuses = ["active", "paused", "ended"] as const;
export const sessionStatuses = ["scheduled", "completed", "cancelled", "missed"] as const;
export const invoiceStatuses = ["draft", "sent", "paid", "overdue"] as const;

const meetMessage = "Use a Google Meet link like https://meet.google.com/abc-defg-hij";
const optionalMeetUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || MEET_URL_PATTERN.test(v), meetMessage);

export const newMatchSchema = z.object({
  studentId: z.string().min(1, "Choose a student"),
  tutorId: z.string().min(1, "Choose a tutor"),
  subject: z.string().min(1, "Choose a subject"),
  sessionsPerWeek: z.number().int().min(1).max(7),
  meetingUrl: optionalMeetUrl,
});
export type NewMatchInput = z.infer<typeof newMatchSchema>;

export const scheduleSessionSchema = z.object({
  assignmentId: z.string().min(1, "Choose a match"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  durationMin: z.number().int().min(15).max(180),
  topic: z.string().max(140),
});
export type ScheduleSessionInput = z.infer<typeof scheduleSessionSchema>;

export const invoiceLineSchema = z.object({
  description: z.string().min(2, "Describe the line"),
  quantity: z.number().int("Whole numbers only").min(1, "At least 1"),
  unitAmount: z.number().min(0, "Can't be negative"),
});

export const createInvoiceSchema = z.object({
  parentId: z.string().min(1, "Choose a family"),
  currency: z.enum(["GBP", "CAD"]),
  periodLabel: z.string().min(2, "Add a period, e.g. November 2026"),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
  lines: z.array(invoiceLineSchema).min(1, "Add at least one line"),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
