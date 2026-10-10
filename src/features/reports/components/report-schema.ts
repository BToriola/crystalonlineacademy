import { z } from "zod";

export const reportSchema = z.object({
  id: z.string().optional(),
  student_id: z.string().min(1, "Choose a student"),
  subject: z.string().trim().min(1, "Add a subject"),
  period_label: z.string().trim().min(2, "e.g. Autumn term · Weeks 1–6"),
  current_focus: z.string().trim().min(2, "What are you working on right now?"),
  curriculum_ref: z.string().trim().max(200),
  next_assessment: z.string().trim().max(200),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name the skill"),
        status: z.enum(["mastered", "improving", "needs_support"]),
      }),
    )
    .min(1, "Add at least one skill"),
  roadmap: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Name the milestone"),
        status: z.enum(["done", "current", "upcoming"]),
      }),
    )
    .min(1, "Add at least one milestone"),
  recommendation: z.string().trim().min(10, "A sentence or two of advice for the family"),
  attendance_rate: z.number().int().min(0).max(100),
  effort_score: z.number().int().min(1).max(5),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
