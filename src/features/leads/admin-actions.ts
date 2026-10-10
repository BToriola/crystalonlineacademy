"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { leadStatuses } from "@/features/admin/schemas";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({ id: z.string().min(1), status: z.enum(leadStatuses) });
const notesSchema = z.object({ id: z.string().min(1), notes: z.string().max(4000) });

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "That status isn't valid." };
  if (isDemoMode) return demoResult("Status updated (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true, message: "Status updated." };
}

export async function saveLeadNotes(id: string, notes: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = notesSchema.safeParse({ id, notes });
  if (!parsed.success) return { ok: false, error: "Notes are too long (4,000 characters max)." };
  if (isDemoMode) return demoResult("Notes saved (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ notes: parsed.data.notes.trim() || null })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true, message: "Notes saved." };
}
