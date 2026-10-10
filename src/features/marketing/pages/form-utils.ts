import type { z } from "zod";

export type FieldErrors = Partial<Record<string, string>>;

/** First error message per top-level field, for inline form errors. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const noopSubscribe = () => () => {};

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export const fieldInputClass = "h-12 rounded-xl px-4 text-base md:text-base";
export const fieldSelectClass = "h-12! w-full rounded-xl px-4 text-base";
