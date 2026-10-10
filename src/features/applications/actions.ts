"use server";

import { revalidatePath } from "next/cache";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { tutorApplicationSchema, type TutorApplicationInput } from "./schemas";

export async function submitTutorApplication(input: TutorApplicationInput): Promise<ActionResult> {
  const parsed = tutorApplicationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };

  const { consent: _consent, cv_url, ...application } = parsed.data;
  void _consent;

  if (isDemoMode) return demoResult("Application received (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase.from("tutor_applications").insert({
    ...application,
    cv_url: cv_url || null,
  });
  if (error) return { ok: false, error: "We couldn't submit your application just now. Please try again shortly." };

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true, message: "Application received. We'll email you about next steps within 5 working days." };
}
