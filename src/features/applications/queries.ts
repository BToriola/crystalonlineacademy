import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoApplications } from "@/lib/demo/data";
import type { TutorApplication } from "@/types/database";

export async function listApplications(): Promise<TutorApplication[]> {
  if (isDemoMode) return demoApplications;
  const supabase = await createClient();
  const { data } = await supabase.from("tutor_applications").select("*").order("created_at", { ascending: false });
  return (data ?? []) as TutorApplication[];
}
