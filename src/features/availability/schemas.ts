import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");

export const availabilitySchema = z.object({
  slots: z
    .array(
      z
        .object({ weekday: z.number().int().min(0).max(6), start_time: time, end_time: time })
        .refine((s) => s.end_time > s.start_time, { message: "Each slot must end after it starts" }),
    )
    .max(60),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type AvailabilitySlot = AvailabilityInput["slots"][number];
