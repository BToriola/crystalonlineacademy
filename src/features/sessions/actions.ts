"use server";

import { revalidatePath } from "next/cache";
import { MEET_URL_PATTERN } from "@/features/attendance/constants";
import { requireUser } from "@/features/auth/session";
import { logSessionSchema, type LogSessionInput } from "@/features/tutor/schemas";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function logSession(input: LogSessionInput): Promise<ActionResult> {
  const user = await requireUser("tutor", "admin");
  const parsed = logSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { sessionId, status, topic, notes, homework } = parsed.data;
  if (isDemoMode) return demoResult("Session logged (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .update({ status, topic: topic || null, tutor_notes: notes || null, homework: homework || null })
    .eq("id", sessionId)
    .eq("tutor_id", user.id)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "We couldn't find that session on your timetable." };

  revalidatePath("/tutor", "layout");
  return { ok: true, message: "Session logged — the family can see your notes now." };
}

export async function proposeMeetingLink(assignmentId: string, url: string): Promise<ActionResult> {
  await requireUser("tutor", "admin");
  const link = url.trim();
  if (!assignmentId) return { ok: false, error: "Missing class." };
  if (!MEET_URL_PATTERN.test(link)) {
    return { ok: false, error: "Use a Google Meet link like https://meet.google.com/abc-defg-hij" };
  }
  if (isDemoMode) return demoResult("Link sent to the admin for approval (demo)");

  const supabase = await createClient();
  const { error } = await supabase.rpc("propose_meeting_link", { p_assignment_id: assignmentId, p_url: link });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/tutor/students", "layout");
  return { ok: true, message: "Link sent to the admin for approval." };
}
