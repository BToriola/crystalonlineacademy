import { z } from "zod";

export const degreeClasses = ["First class", "Upper second (2:1)", "Master's degree", "PhD / Doctorate"] as const;

export const teachingLevels = ["Early Years", "KS1", "KS2", "KS3", "GCSE", "Grade 1–6", "Grade 7–9", "Grade 10–12"] as const;

export const applicantCountries = ["Nigeria", "Ghana", "Sierra Leone", "Kenya", "United Kingdom", "Canada", "Other"] as const;

export const tutorApplicationSchema = z.object({
  full_name: z.string().trim().min(2, "Tell us your full name").max(120),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone or WhatsApp number")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Use digits, spaces and + only"),
  country: z.enum(applicantCountries, { error: "Choose your country" }),
  timezone: z.string().min(1, "Choose your time zone"),
  subjects: z.array(z.string().min(1)).min(1, "Pick at least one subject").max(6, "Pick up to 6 subjects"),
  levels: z.array(z.string().min(1)).min(1, "Pick at least one level"),
  qualification: z.string().trim().min(4, "Tell us your degree and subject, e.g. B.Sc Mathematics").max(160),
  degree_class: z.enum(degreeClasses, { error: "Choose your degree class" }),
  years_experience: z.coerce.number<string | number>().int().min(0, "Enter 0 or more").max(50, "That seems high — please check"),
  motivation: z
    .string()
    .trim()
    .min(60, "Tell us a little more (at least 60 characters)")
    .max(2000, "Please keep this under 2,000 characters"),
  cv_url: z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Paste a full link, starting with https://" })]).optional().default(""),
  consent: z.literal(true, { error: "Please confirm the details are accurate" }),
});

export type TutorApplicationInput = z.input<typeof tutorApplicationSchema>;
