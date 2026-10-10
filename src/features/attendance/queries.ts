import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoAttendance } from "@/lib/demo/data";
import type { Attendance, Session } from "@/types/database";
import { LATE_AFTER_MIN } from "./constants";

export async function listAttendance(sessionIds: string[]): Promise<Attendance[]> {
  if (!sessionIds.length) return [];
  if (isDemoMode) return demoAttendance.filter((a) => sessionIds.includes(a.session_id));
  const supabase = await createClient();
  const { data } = await supabase.from("session_attendance").select("*").in("session_id", sessionIds).order("joined_at");
  return (data ?? []) as Attendance[];
}

export type AttendanceFlag = "tutor_late" | "tutor_no_show" | "student_no_show";

export type AttendanceSummary = {
  tutorJoinedAt: string | null;
  familyJoinedAt: string | null;
  adminJoinedAt: string | null;
  tutorLateByMin: number;
  flags: AttendanceFlag[];
};

export function summariseAttendance(session: Session, rows: Attendance[], now = Date.now()): AttendanceSummary {
  const mine = rows.filter((r) => r.session_id === session.id);
  const first = (pred: (r: Attendance) => boolean) => mine.find(pred)?.joined_at ?? null;

  const tutorJoinedAt = first((r) => r.profile_id === session.tutor_id);
  const familyJoinedAt = first((r) => r.role === "parent" || r.role === "student");
  const adminJoinedAt = first((r) => r.role === "admin" && r.profile_id !== session.tutor_id);

  const start = new Date(session.starts_at).getTime();
  const end = start + session.duration_min * 60_000;
  const lateMs = tutorJoinedAt ? new Date(tutorJoinedAt).getTime() - start : 0;
  const tutorLateByMin = Math.max(0, Math.round(lateMs / 60_000));

  const flags: AttendanceFlag[] = [];
  const counts = session.status !== "cancelled";
  if (counts && tutorLateByMin > LATE_AFTER_MIN) flags.push("tutor_late");
  if (counts && !tutorJoinedAt && now > start + LATE_AFTER_MIN * 60_000) flags.push("tutor_no_show");
  if (counts && !familyJoinedAt && now > Math.min(end, start + 15 * 60_000)) flags.push("student_no_show");

  return { tutorJoinedAt, familyJoinedAt, adminJoinedAt, tutorLateByMin, flags };
}
