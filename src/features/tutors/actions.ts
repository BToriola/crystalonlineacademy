"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ id: z.string().min(1), published: z.boolean() });

export async function toggleTutorPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = schema.safeParse({ id, published });
  if (!parsed.success) return { ok: false, error: "Tutor not found." };
  const message = parsed.data.published ? "Profile is now live on the website." : "Profile hidden from the website.";
  if (isDemoMode) return demoResult(`${message} (demo mode — nothing was stored)`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("tutor_profiles")
    .update({ is_published: parsed.data.published })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/tutors");
  revalidatePath("/tutors");
  return { ok: true, message };
}
