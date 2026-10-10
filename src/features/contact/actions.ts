"use server";

import { revalidatePath } from "next/cache";
import { demoResult, type ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { contactSchema, type ContactInput } from "./schemas";

export async function submitContactMessage(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };

  if (isDemoMode) return demoResult("Message sent (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert(parsed.data);
  if (error) return { ok: false, error: "We couldn't send your message just now. Please email or WhatsApp us instead." };

  revalidatePath("/admin");
  return { ok: true, message: "Thanks for getting in touch. We'll reply within one working day." };
}
