"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { reportSchema, type ReportFormValues } from "@/features/reports/components/report-schema";
import type { ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function upsertReport(input: ReportFormValues, publish: boolean): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser("tutor", "admin");
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { id, ...values } = parsed.data;
  const verb = publish ? "published" : "saved as a draft";
  if (isDemoMode) {
    return { ok: true, message: `Report ${verb} (demo mode — nothing was stored).`, data: { id: id ?? "demo" } };
  }

  const row = {
    ...values,
    curriculum_ref: values.curriculum_ref || null,
    next_assessment: values.next_assessment || null,
    ...(publish ? { published_at: new Date().toISOString() } : {}),
  };

  const supabase = await createClient();
  const query = id
    ? supabase.from("progress_reports").update(row).eq("id", id).eq("tutor_id", user.id)
    : supabase.from("progress_reports").insert({ ...row, tutor_id: user.id });
  const { data, error } = await query.select("id").single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/tutor/reports", "layout");
  revalidatePath(`/tutor/students/${values.student_id}`);
  if (publish) revalidatePath("/parent", "layout");
  return {
    ok: true,
    message: publish ? "Report published — the family can see it now." : "Draft saved.",
    data: { id: (data as { id: string }).id },
  };
}

export async function saveReport(input: ReportFormValues) {
  return upsertReport(input, false);
}

export async function publishReport(input: ReportFormValues) {
  return upsertReport(input, true);
}
