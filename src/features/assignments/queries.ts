import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoAssignments } from "@/lib/demo/data";
import type { Assignment } from "@/types/database";

export async function listAssignments(filter: { tutorId?: string; studentIds?: string[] } = {}): Promise<Assignment[]> {
  if (isDemoMode) {
    return demoAssignments.filter(
      (a) => (!filter.tutorId || a.tutor_id === filter.tutorId) && (!filter.studentIds || filter.studentIds.includes(a.student_id)),
    );
  }
  const supabase = await createClient();
  let query = supabase.from("assignments").select("*").order("created_at", { ascending: false });
  if (filter.tutorId) query = query.eq("tutor_id", filter.tutorId);
  if (filter.studentIds) query = query.in("student_id", filter.studentIds);
  const { data } = await query;
  return (data ?? []) as Assignment[];
}
