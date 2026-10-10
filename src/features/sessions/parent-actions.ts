"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { rateSessionSchema, rescheduleSchema } from "@/features/parent/schemas";
import { getSession } from "@/features/sessions/queries";
import { getStudent } from "@/features/students/queries";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function getOwnSession(sessionId: string, parentId: string) {
  const session = await getSession(sessionId);
  if (!session) return null;
  const student = await getStudent(session.student_id);
  return student?.parent_id === parentId ? { session, student } : null;
}

export async function rateSession(input: { sessionId: string; rating: number; feedback?: string }): Promise<ActionResult> {
  const user = await requireUser("parent");
  const parsed = rateSessionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const owned = await getOwnSession(parsed.data.sessionId, user.id);
  if (!owned) return { ok: false, error: "We couldn't find that session." };
  if (owned.session.status !== "completed") return { ok: false, error: "You can rate a session once it has taken place." };

  if (isDemoMode) return demoResult("Thanks for your rating! (demo mode — nothing was stored)");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ parent_rating: parsed.data.rating, parent_feedback: parsed.data.feedback ?? null })
    .eq("id", parsed.data.sessionId);
  if (error) return { ok: false, error: "We couldn't save your rating. Please try again." };

  revalidatePath("/parent", "layout");
  return { ok: true, message: "Thanks — your tutor will see your feedback." };
}

export async function requestReschedule(input: { sessionId: string; preferred: string; reason?: string }): Promise<ActionResult> {
  const user = await requireUser("parent");
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const owned = await getOwnSession(parsed.data.sessionId, user.id);
  if (!owned) return { ok: false, error: "We couldn't find that session." };
  if (owned.session.status !== "scheduled") return { ok: false, error: "Only upcoming sessions can be rescheduled." };

  if (isDemoMode) return demoResult("Reschedule request sent (demo mode) — your tutor would normally reply within a day.");

  const { session, student } = owned;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: user.full_name,
    email: user.email,
    topic: "Reschedule request",
    message: [
      `Child: ${student.first_name} ${student.last_name ?? ""}`.trim(),
      `Session: ${session.subject} on ${session.starts_at} (${session.id})`,
      `Preferred time (${user.timezone}): ${parsed.data.preferred}`,
      parsed.data.reason ? `Reason: ${parsed.data.reason}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
  if (error) return { ok: false, error: "We couldn't send your request. Please try again." };

  return { ok: true, message: "Request sent — we'll confirm the new time with you shortly." };
}
