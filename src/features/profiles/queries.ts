import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { allDemoProfiles, demoParents } from "@/lib/demo/data";
import type { Profile } from "@/types/database";

export async function getProfilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  const unique = [...new Set(ids)];
  if (!unique.length) return {};
  let rows: Profile[];
  if (isDemoMode) {
    rows = allDemoProfiles.filter((p) => unique.includes(p.id));
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").in("id", unique);
    rows = (data ?? []) as Profile[];
  }
  return Object.fromEntries(rows.map((p) => [p.id, p]));
}

export async function listParents(): Promise<Profile[]> {
  if (isDemoMode) return demoParents;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("role", "parent").order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}
