"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { availabilitySchema, type AvailabilityInput } from "./schemas";

export async function saveAvailability(input: AvailabilityInput): Promise<ActionResult> {
  const user = await requireUser("tutor", "admin");
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (isDemoMode) return demoResult("Availability saved (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("tutor_availability").delete().eq("tutor_id", user.id);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (parsed.data.slots.length) {
    const { error } = await supabase
      .from("tutor_availability")
      .insert(parsed.data.slots.map((s) => ({ ...s, tutor_id: user.id })));
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/tutor/availability");
  return { ok: true, message: "Availability saved — the team will match families to these times." };
}
