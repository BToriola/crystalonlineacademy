"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { awardStarsSchema, type AwardStarsInput } from "@/features/tutor/schemas";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function awardStars(input: AwardStarsInput): Promise<ActionResult> {
  const user = await requireUser("tutor", "admin");
  const parsed = awardStarsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { studentId, amount, reason } = parsed.data;
  const stars = `${amount} star${amount === 1 ? "" : "s"}`;
  if (isDemoMode) return demoResult(`${stars} sent! (demo mode — nothing was stored)`);

  const supabase = await createClient();
  const { error } = await supabase.from("star_events").insert({ student_id: studentId, amount, reason, awarded_by: user.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/tutor", "layout");
  revalidatePath("/learner", "layout");
  return { ok: true, message: `${stars} sent — they'll see them in their space.` };
}
