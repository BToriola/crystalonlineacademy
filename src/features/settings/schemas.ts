import { z } from "zod";

export const countries = [
  { value: "UK", label: "🇬🇧 United Kingdom" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "NG", label: "🇳🇬 Nigeria" },
  { value: "OTHER", label: "🌍 Somewhere else" },
] as const;

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^[+\d][\d\s()-]{5,}$/.test(v), "That doesn't look like a phone number"),
  timezone: z.string().min(1, "Choose a time zone"),
  country: z.enum(["UK", "CA", "NG", "OTHER"]),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const tutorLevels = ["EYFS", "KS1", "KS2", "KS3", "GCSE", "Grade 1–3", "Grade 4–8", "Grade 9–12"] as const;

export const tutorProfileSchema = z.object({
  headline: z.string().trim().min(4, "A short headline helps families find you").max(80),
  bio: z.string().trim().min(20, "Tell families a little more (20+ characters)").max(1200),
  subjects: z.array(z.string()).min(1, "Pick at least one subject"),
  levels: z.array(z.string()).min(1, "Pick at least one level"),
  qualification: z.string().trim().max(160),
  languages: z.array(z.string().trim().min(1)).min(1, "Add at least one language"),
});

export type TutorProfileValues = z.infer<typeof tutorProfileSchema>;

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export type PasswordValues = z.infer<typeof passwordSchema>;
