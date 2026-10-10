"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assignmentStatuses, newMatchSchema, type NewMatchInput } from "@/features/admin/schemas";
import { MEET_URL_PATTERN } from "@/features/attendance/constants";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function createAssignment(input: NewMatchInput): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = newMatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  if (isDemoMode) return demoResult("Match created (demo mode — nothing was stored).");

  const { studentId, tutorId, subject, sessionsPerWeek, meetingUrl } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").insert({
    student_id: studentId,
    tutor_id: tutorId,
    subject,
    sessions_per_week: sessionsPerWeek,
    meeting_url: meetingUrl || null,
    status: "active",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/matches");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin");
  return { ok: true, message: "Match created — the tutor will see their new student straight away." };
}

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(assignmentStatuses) });

export async function updateAssignmentStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "That status isn't valid." };
  if (isDemoMode) return demoResult(`Match ${parsed.data.status === "active" ? "resumed" : parsed.data.status} (demo mode — nothing was stored).`);

  const supabase = await createClient();
  const { error } = await supabase.from("assignments").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/matches");
  revalidatePath("/admin/tutors");
  return { ok: true, message: "Match updated." };
}

const idSchema = z.string().min(1);

export async function approveMeetingLink(id: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Match not found." };
  if (isDemoMode) return demoResult("Meeting link approved (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { data } = await supabase.from("assignments").select("proposed_meeting_url").eq("id", parsed.data).maybeSingle();
  const proposed = (data as { proposed_meeting_url: string | null } | null)?.proposed_meeting_url;
  if (!proposed) return { ok: false, error: "There's no proposed link to approve." };
  if (!MEET_URL_PATTERN.test(proposed)) return { ok: false, error: "That isn't a valid Google Meet link — reject it instead." };

  const { error } = await supabase
    .from("assignments")
    .update({ meeting_url: proposed, meeting_url_approved_at: new Date().toISOString(), proposed_meeting_url: null })
    .eq("id", parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/matches");
  return { ok: true, message: "Meeting link approved — every session now uses it." };
}

export async function rejectMeetingLink(id: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Match not found." };
  if (isDemoMode) return demoResult("Proposed link rejected (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase.from("assignments").update({ proposed_meeting_url: null }).eq("id", parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/matches");
  return { ok: true, message: "Proposed link rejected. The tutor can suggest another." };
}
