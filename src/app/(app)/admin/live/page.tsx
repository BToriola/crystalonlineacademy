import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { listAttendance, summariseAttendance } from "@/features/attendance/queries";
import { LiveBoard, type LiveRow } from "@/features/attendance/components/live-board";
import { AutoRefresh } from "@/features/attendance/components/auto-refresh";
import { requireUser } from "@/features/auth/session";
import { getProfilesByIds } from "@/features/profiles/queries";
import { listSessions } from "@/features/sessions/queries";
import { listStudents } from "@/features/students/queries";

export const metadata: Metadata = { title: "Live classes" };

const HOUR = 3_600_000;

export default async function LiveClassesPage() {
  const admin = await requireUser("admin");
  const { rows, now } = await loadBoard();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Supervision"
        title="Live classes"
        description="See who's in each lesson right now, spot late starts and no-shows, and drop in on any class. Every join through the portal is logged."
        actions={<AutoRefresh />}
      />
      <LiveBoard rows={rows} timezone={admin.timezone} now={now} />
    </div>
  );
}

async function loadBoard() {
  const now = Date.now();
  const [sessions, students] = await Promise.all([
    listSessions({ from: new Date(now - 7 * 24 * HOUR), to: new Date(now + 2 * HOUR) }),
    listStudents(),
  ]);
  const attendance = await listAttendance(sessions.map((s) => s.id));
  const profiles = await getProfilesByIds([...sessions.map((s) => s.tutor_id), ...students.map((s) => s.parent_id)]);
  const studentById = new Map(students.map((s) => [s.id, s]));

  const rows: LiveRow[] = sessions.map((session) => {
    const student = studentById.get(session.student_id);
    const parent = student ? profiles[student.parent_id] : undefined;
    const tutor = profiles[session.tutor_id];
    return {
      session,
      studentName: student ? `${student.first_name} ${student.last_name ?? ""}`.trim() : "Student",
      studentSeed: student?.avatar_seed ?? session.student_id,
      tutorName: tutor?.full_name ?? "Tutor",
      tutorTimezone: tutor?.timezone ?? "Africa/Lagos",
      familyTimezone: parent?.timezone ?? "Europe/London",
      attendance: summariseAttendance(session, attendance, now),
    };
  });

  return { rows, now };
}
