import { z } from "zod";
import { yearGroups } from "@/config/site";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const addChildSchema = z
  .object({
    first_name: z.string().trim().min(1, "Please enter a first name.").max(60),
    last_name: optionalText(60),
    curriculum: z.enum(["uk", "ca"], { error: "Choose a curriculum." }),
    year_group: z.string().min(1, "Choose a year group."),
    learning_notes: optionalText(1000),
  })
  .refine((v) => (yearGroups[v.curriculum === "uk" ? "UK" : "CA"] as readonly string[]).includes(v.year_group), {
    message: "Choose a year group for this curriculum.",
    path: ["year_group"],
  });

export type AddChildInput = z.input<typeof addChildSchema>;

export const tutorChangeSchema = z.object({
  studentId: z.string().min(1),
  reason: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(2000),
});

export const rateSessionSchema = z.object({
  sessionId: z.string().min(1),
  rating: z.number().int().min(1, "Pick 1 to 5 stars.").max(5),
  feedback: optionalText(1000),
});

export const rescheduleSchema = z.object({
  sessionId: z.string().min(1),
  preferred: z.string().trim().min(3, "Tell us when would suit you better.").max(300),
  reason: optionalText(1000),
});
