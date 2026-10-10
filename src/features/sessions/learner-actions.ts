"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import { getSession } from "@/features/sessions/queries";
import { getStudentForProfile } from "@/features/students/queries";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const toggleSchema = z.object({ sessionId: z.string().min(1), done: z.boolean() });

export async function toggleHomework(input: { sessionId: string; done: boolean }): Promise<ActionResult> {
  const user = await requireUser("student");
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Something went wrong — try again." };

  const [student, session] = await Promise.all([getStudentForProfile(user.id), getSession(parsed.data.sessionId)]);
  if (!student || !session || session.student_id !== student.id || !session.homework) {
    return { ok: false, error: "We couldn't find that homework." };
  }

  if (isDemoMode) return demoResult(parsed.data.done ? "Homework done — brilliant!" : "Moved back to your to-do list.");

  const supabase = await createClient();
  const { error } = await supabase.from("sessions").update({ homework_done: parsed.data.done }).eq("id", session.id);
  if (error) return { ok: false, error: "That didn't save — try again in a moment." };

  revalidatePath("/learner", "layout");
  return { ok: true, message: parsed.data.done ? "Homework done — brilliant!" : "Moved back to your to-do list." };
}
