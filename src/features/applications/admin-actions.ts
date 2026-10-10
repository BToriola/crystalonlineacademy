"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { applicationStatuses } from "@/features/admin/schemas";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(applicationStatuses) });
const reviewSchema = z.object({
  id: z.string().min(1),
  assessmentScore: z.number().int().min(0).max(100).nullable(),
  notes: z.string().max(4000),
});

export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "That stage isn't valid." };
  if (isDemoMode) return demoResult("Stage updated (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tutor_applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true, message: "Stage updated." };
}

export async function saveApplicationReview(
  id: string,
  review: { assessmentScore: number | null; notes: string },
): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = reviewSchema.safeParse({ id, ...review });
  if (!parsed.success) return { ok: false, error: "Scores must be between 0 and 100." };
  if (isDemoMode) return demoResult("Review saved (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tutor_applications")
    .update({ assessment_score: parsed.data.assessmentScore, notes: parsed.data.notes.trim() || null })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/applications");
  return { ok: true, message: "Review saved." };
}
