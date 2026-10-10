"use server";

import { revalidatePath } from "next/cache";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getTutor } from "@/features/tutors/queries";
import { trialRequestSchema, type TrialRequestInput } from "./schemas";

export async function submitTrialRequest(input: TrialRequestInput): Promise<ActionResult> {
  const parsed = trialRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };

  const { tutor_id, consent: _consent, ...lead } = parsed.data;
  void _consent;

  if (isDemoMode) return demoResult("Thanks! Your free trial request is in (demo mode — nothing was stored).");

  const requested = tutor_id ? await getTutor(tutor_id) : null;
  const notes = requested ? `Requested tutor: ${requested.full_name} (${requested.id})` : null;
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    ...lead,
    phone: lead.phone || null,
    goals: lead.goals || null,
    preferred_times: lead.preferred_times || null,
    heard_from: lead.heard_from || null,
    notes,
  });
  if (error) return { ok: false, error: "We couldn't send your request just now. Please try again or message us on WhatsApp." };

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true, message: "Thanks! We'll be in touch within 24 hours." };
}
