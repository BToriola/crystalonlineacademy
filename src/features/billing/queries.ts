import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoInvoices } from "@/lib/demo/data";
import type { Invoice } from "@/types/database";

export async function listInvoices(filter: { parentId?: string } = {}): Promise<Invoice[]> {
  if (isDemoMode) {
    return demoInvoices
      .filter((i) => !filter.parentId || i.parent_id === filter.parentId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const supabase = await createClient();
  let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (filter.parentId) query = query.eq("parent_id", filter.parentId);
  const { data } = await query;
  return (data ?? []) as Invoice[];
}
