import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoLeads } from "@/lib/demo/data";
import type { Lead } from "@/types/database";

export async function listLeads(): Promise<Lead[]> {
  if (isDemoMode) return demoLeads;
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}
