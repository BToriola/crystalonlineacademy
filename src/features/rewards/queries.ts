import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { badgeCatalog, demoBadges, demoStarEvents } from "@/lib/demo/data";
import type { Badge, StarEvent } from "@/types/database";

export { badgeCatalog };

export async function getBadges(studentId: string): Promise<Badge[]> {
  if (isDemoMode) return demoBadges[studentId] ?? badgeCatalog.map((b) => ({ ...b, earned_at: null }));
  const supabase = await createClient();
  const { data } = await supabase.from("student_badges").select("badge_key, earned_at").eq("student_id", studentId);
  const earned = new Map((data ?? []).map((b) => [b.badge_key as string, b.earned_at as string]));
  return badgeCatalog.map((b) => ({ ...b, earned_at: earned.get(b.key) ?? null }));
}

export async function getStarEvents(studentId: string): Promise<StarEvent[]> {
  if (isDemoMode) return demoStarEvents.filter((s) => s.student_id === studentId);
  const supabase = await createClient();
  const { data } = await supabase.from("star_events").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(30);
  return (data ?? []) as StarEvent[];
}
