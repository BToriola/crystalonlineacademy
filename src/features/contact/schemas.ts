import { z } from "zod";

export const contactTopics = [
  "Tutoring for my child",
  "Pricing & plans",
  "An existing booking",
  "Billing",
  "Becoming a tutor",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.email("Enter a valid email address"),
  topic: z.enum(contactTopics, { error: "Choose a topic" }),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(4000, "Please keep this under 4,000 characters"),
});

export type ContactInput = z.input<typeof contactSchema>;
