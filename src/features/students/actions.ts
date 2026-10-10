"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { addChildSchema, tutorChangeSchema, type AddChildInput } from "@/features/parent/schemas";
import { getStudent } from "@/features/students/queries";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function addChild(input: AddChildInput): Promise<ActionResult> {
  const user = await requireUser("parent");
  const parsed = addChildSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { first_name, last_name, curriculum, year_group, learning_notes } = parsed.data;
  if (isDemoMode) return demoResult(`${first_name} added (demo mode — nothing was stored).`);

  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({
    parent_id: user.id,
    first_name,
    last_name: last_name ?? null,
    curriculum,
    year_group,
    learning_notes: learning_notes ?? null,
    avatar_seed: `${first_name}-${crypto.randomUUID().slice(0, 8)}`.toLowerCase(),
  });
  if (error) return { ok: false, error: "We couldn't add your child. Please try again." };

  revalidatePath("/parent", "layout");
  return { ok: true, message: `${first_name} has been added to your family.` };
}

export async function requestTutorChange(input: { studentId: string; reason: string }): Promise<ActionResult> {
  const user = await requireUser("parent");
  const parsed = tutorChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const student = await getStudent(parsed.data.studentId);
  if (!student || student.parent_id !== user.id) return { ok: false, error: "We couldn't find that child on your account." };

  if (isDemoMode) return demoResult("Request received (demo mode) — our team would normally be in touch within one working day.");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: user.full_name,
    email: user.email,
    topic: "Tutor change",
    message: `Child: ${student.first_name} ${student.last_name ?? ""} (${student.id})\n\n${parsed.data.reason}`.trim(),
  });
  if (error) return { ok: false, error: "We couldn't send your request. Please try again." };

  return { ok: true, message: "Thanks — our team will be in touch within one working day." };
}
