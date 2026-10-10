import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoReports } from "@/lib/demo/data";
import type { ProgressReport } from "@/types/database";

export async function listReports(filter: { tutorId?: string; studentIds?: string[]; publishedOnly?: boolean } = {}): Promise<ProgressReport[]> {
  if (isDemoMode) {
    return demoReports
      .filter(
        (r) =>
          (!filter.tutorId || r.tutor_id === filter.tutorId) &&
          (!filter.studentIds || filter.studentIds.includes(r.student_id)) &&
          (!filter.publishedOnly || r.published_at),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const supabase = await createClient();
  let query = supabase.from("progress_reports").select("*").order("created_at", { ascending: false });
  if (filter.tutorId) query = query.eq("tutor_id", filter.tutorId);
  if (filter.studentIds) query = query.in("student_id", filter.studentIds);
  if (filter.publishedOnly) query = query.not("published_at", "is", null);
  const { data } = await query;
  return (data ?? []) as ProgressReport[];
}

export async function getReport(id: string): Promise<ProgressReport | null> {
  if (isDemoMode) return demoReports.find((r) => r.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("progress_reports").select("*").eq("id", id).maybeSingle();
  return (data as ProgressReport | null) ?? null;
}
