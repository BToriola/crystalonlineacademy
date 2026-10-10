"use server";

import { revalidatePath } from "next/cache";
import { scheduleSessionSchema, type ScheduleSessionInput } from "@/features/admin/schemas";
import { zonedToUtcIso } from "@/features/admin/lib/time";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { friendlyDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Assignment } from "@/types/database";

export async function createSession(input: ScheduleSessionInput): Promise<ActionResult<{ startsAt: string }>> {
  const admin = await requireUser("admin");
  const parsed = scheduleSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  // The date and time were picked in the admin's own timezone, so convert from there.
  const startsAt = zonedToUtcIso(parsed.data.date, parsed.data.time, admin.timezone);
  if (!startsAt) return { ok: false, error: "That date or time isn't valid." };
  const label = friendlyDateTime(startsAt, admin.timezone);

  if (isDemoMode) return { ...demoResult(`Session booked for ${label} (demo mode — nothing was stored).`), data: { startsAt } };

  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", parsed.data.assignmentId)
    .maybeSingle();
  const match = assignment as Assignment | null;
  if (!match) return { ok: false, error: "That match no longer exists." };
  if (match.status !== "active") return { ok: false, error: "Resume this match before booking new sessions." };

  const { error } = await supabase.from("sessions").insert({
    assignment_id: match.id,
    student_id: match.student_id,
    tutor_id: match.tutor_id,
    subject: match.subject,
    starts_at: startsAt,
    duration_min: parsed.data.durationMin,
    meeting_url: match.meeting_url,
    topic: parsed.data.topic.trim() || null,
    status: "scheduled",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sessions");
  revalidatePath("/admin");
  return { ok: true, message: `Session booked for ${label}.`, data: { startsAt } };
}
