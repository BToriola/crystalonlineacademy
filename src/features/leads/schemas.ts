import { z } from "zod";
import { yearGroups } from "@/config/site";

export const trialRegionSchema = z.object({
  country: z.enum(["UK", "CA"], { error: "Choose where you live" }),
  timezone: z.string().min(1, "Choose your time zone"),
});

export const trialChildSchema = z.object({
  child_name: z.string().trim().min(2, "Tell us your child's first name").max(80),
  year_group: z.string().min(1, "Choose a year group"),
  subjects: z.array(z.string().min(1)).min(1, "Pick at least one subject").max(8),
});

export const trialGoalsSchema = z.object({
  goals: z.string().trim().max(2000, "Please keep this under 2,000 characters").optional().default(""),
  preferred_times: z.string().trim().max(500).optional().default(""),
  heard_from: z.string().trim().max(200).optional().default(""),
});

export const trialParentSchema = z.object({
  parent_name: z.string().trim().min(2, "Tell us your name").max(120),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only")
    .optional()
    .default(""),
  consent: z.literal(true, { error: "Please confirm you're happy for us to contact you" }),
});

export const trialRequestSchema = trialRegionSchema
  .extend(trialChildSchema.shape)
  .extend(trialGoalsSchema.shape)
  .extend(trialParentSchema.shape)
  .extend({ tutor_id: z.string().max(100).optional() })
  .refine((v) => (yearGroups[v.country] as readonly string[]).includes(v.year_group), {
    message: "Choose a year group for your region",
    path: ["year_group"],
  });

export type TrialRequestInput = z.input<typeof trialRequestSchema>;
