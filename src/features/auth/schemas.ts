import { z } from "zod";

export type ActionState = { ok: boolean; error?: string; message?: string } | null;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Tell us your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  country: z.enum(["UK", "CA", "NG", "OTHER"]).default("UK"),
  timezone: z.string().default("Europe/London"),
});

export const resetSchema = z.object({
  email: z.email("Enter a valid email address"),
});
