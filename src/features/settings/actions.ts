"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, tutorProfileSchema, type ProfileValues, type TutorProfileValues } from "./schemas";

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function updateProfile(input: ProfileValues): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isValidTimeZone(parsed.data.timezone)) return { ok: false, error: "That time zone isn't recognised." };
  if (isDemoMode) return demoResult("Profile updated (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, phone: parsed.data.phone || null })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function updateTutorProfile(input: TutorProfileValues): Promise<ActionResult> {
  const user = await requireUser("tutor", "admin");
  const parsed = tutorProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (isDemoMode) return demoResult("Tutor profile updated (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tutor_profiles")
    .update({ ...parsed.data, qualification: parsed.data.qualification || null })
    .eq("id", user.id)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Your tutor profile hasn't been set up yet — ask the academy team to create it." };

  revalidatePath("/settings");
  revalidatePath("/tutors", "layout");
  return { ok: true, message: "Public profile updated." };
}
