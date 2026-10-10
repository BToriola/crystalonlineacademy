import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type StaffInvite = { email: string; role: "admin" | "tutor"; accepted_at: string | null; created_at: string };

export async function listPendingInvites(): Promise<StaffInvite[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("staff_invites").select("*").is("accepted_at", null).order("created_at", { ascending: false });
  return (data ?? []) as StaffInvite[];
}
