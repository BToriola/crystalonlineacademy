import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { roleHome } from "@/features/auth/constants";
import { JOIN_OPENS_MIN_BEFORE } from "@/features/attendance/constants";
import { getSession } from "@/features/sessions/queries";
import { getStudent } from "@/features/students/queries";
import { listAssignments } from "@/features/assignments/queries";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** Every "Join lesson" button lands here: checks access and the time window, logs the join, then redirects to Meet. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=/join/${sessionId}`, request.url));

  const back = (reason: string) => NextResponse.redirect(new URL(`${roleHome[user.role]}?join=${reason}`, request.url));

  const session = await getSession(sessionId);
  if (!session || session.status === "cancelled") return back("unavailable");

  const student = await getStudent(session.student_id);
  const allowed =
    user.role === "admin" ||
    session.tutor_id === user.id ||
    student?.parent_id === user.id ||
    student?.profile_id === user.id;
  if (!allowed) return back("forbidden");

  const start = new Date(session.starts_at).getTime();
  const end = start + session.duration_min * 60_000;
  const now = Date.now();
  const isStaff = user.role === "admin" || session.tutor_id === user.id;
  if (!isStaff && (now < start - JOIN_OPENS_MIN_BEFORE * 60_000 || now > end)) return back("closed");

  const [assignment] = await listAssignments({ studentIds: [session.student_id] }).then((rows) =>
    rows.filter((a) => a.id === session.assignment_id),
  );
  const meetingUrl = assignment?.meeting_url ?? session.meeting_url;
  if (!meetingUrl || !assignment?.meeting_url_approved_at) return back("no-link");

  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.from("session_attendance").insert({ session_id: session.id, profile_id: user.id, role: user.role });
  }

  return NextResponse.redirect(meetingUrl);
}
