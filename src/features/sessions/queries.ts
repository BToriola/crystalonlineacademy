import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoSessions } from "@/lib/demo/data";
import type { Session } from "@/types/database";

type SessionFilter = { tutorId?: string; studentIds?: string[]; from?: Date; to?: Date; status?: Session["status"][] };

export async function listSessions(filter: SessionFilter = {}): Promise<Session[]> {
  if (isDemoMode) {
    return demoSessions
      .filter((s) => {
        const t = new Date(s.starts_at).getTime();
        return (
          (!filter.tutorId || s.tutor_id === filter.tutorId) &&
          (!filter.studentIds || filter.studentIds.includes(s.student_id)) &&
          (!filter.from || t >= filter.from.getTime()) &&
          (!filter.to || t <= filter.to.getTime()) &&
          (!filter.status || filter.status.includes(s.status))
        );
      })
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }
  const supabase = await createClient();
  let query = supabase.from("sessions").select("*").order("starts_at");
  if (filter.tutorId) query = query.eq("tutor_id", filter.tutorId);
  if (filter.studentIds) query = query.in("student_id", filter.studentIds);
  if (filter.from) query = query.gte("starts_at", filter.from.toISOString());
  if (filter.to) query = query.lte("starts_at", filter.to.toISOString());
  if (filter.status) query = query.in("status", filter.status);
  const { data } = await query;
  return (data ?? []) as Session[];
}

export async function getSession(id: string): Promise<Session | null> {
  if (isDemoMode) return demoSessions.find((s) => s.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle();
  return (data as Session | null) ?? null;
}
