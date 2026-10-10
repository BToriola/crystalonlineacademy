"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types/database";

const sendSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, "Write a message first").max(4000, "That message is a little long — try splitting it up"),
});

export async function sendMessage(input: { conversationId: string; body: string }): Promise<ActionResult<Message>> {
  const user = await requireUser("parent", "tutor", "admin");
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { conversationId, body } = parsed.data;

  if (isDemoMode) {
    return {
      ok: true,
      data: {
        id: `demo-${crypto.randomUUID()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        body,
        read_at: null,
        created_at: new Date().toISOString(),
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body })
    .select("*")
    .single();
  if (error) return { ok: false, error: "Message not sent — please try again." };

  revalidatePath("/messages");
  return { ok: true, data: data as Message };
}

export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const user = await requireUser("parent", "tutor", "admin");
  if (isDemoMode) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
