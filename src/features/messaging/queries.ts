import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoConversations, demoMessages } from "@/lib/demo/data";
import type { Conversation, Message } from "@/types/database";

export async function listConversations(userId: string): Promise<Conversation[]> {
  if (isDemoMode) {
    return demoConversations
      .filter((c) => c.parent_id === userId || c.tutor_id === userId)
      .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .or(`parent_id.eq.${userId},tutor_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  return (data ?? []) as Conversation[];
}

export async function listMessages(conversationIds: string[]): Promise<Message[]> {
  if (!conversationIds.length) return [];
  if (isDemoMode) return demoMessages.filter((m) => conversationIds.includes(m.conversation_id));
  const supabase = await createClient();
  const { data } = await supabase.from("messages").select("*").in("conversation_id", conversationIds).order("created_at").limit(500);
  return (data ?? []) as Message[];
}
