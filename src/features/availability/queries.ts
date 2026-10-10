import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoAvailability } from "@/lib/demo/data";
import type { Availability } from "@/types/database";

export async function getAvailability(tutorId: string): Promise<Availability[]> {
  if (isDemoMode) return demoAvailability.filter((a) => a.tutor_id === tutorId);
  const supabase = await createClient();
  const { data } = await supabase.from("tutor_availability").select("*").eq("tutor_id", tutorId).order("weekday").order("start_time");
  // Postgres `time` comes back as HH:MM:SS; the editor works in HH:MM.
  return ((data ?? []) as Availability[]).map((a) => ({ ...a, start_time: a.start_time.slice(0, 5), end_time: a.end_time.slice(0, 5) }));
}
