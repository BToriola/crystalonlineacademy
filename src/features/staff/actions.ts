"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const inviteSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["tutor", "admin"]),
});

export async function inviteStaff(input: { email: string; role: "tutor" | "admin" }): Promise<ActionResult> {
  const admin = await requireUser("admin");
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const email = parsed.data.email.trim().toLowerCase();
  if (isDemoMode) return demoResult(`${email} invited as ${parsed.data.role} (demo mode — nothing was stored).`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_invites")
    .upsert({ email, role: parsed.data.role, invited_by: admin.id, accepted_at: null }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/tutors");
  return { ok: true, message: `${email} can now sign up at /signup and will get ${parsed.data.role} access.` };
}

export async function revokeInvite(email: string): Promise<ActionResult> {
  await requireUser("admin");
  if (isDemoMode) return demoResult("Invite removed (demo mode).");
  const supabase = await createClient();
  const { error } = await supabase.from("staff_invites").delete().eq("email", email.toLowerCase()).is("accepted_at", null);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tutors");
  return { ok: true, message: "Invite removed." };
}
