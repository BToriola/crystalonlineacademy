import "server-only";
import { listAssignments } from "@/features/assignments/queries";
import { getProfilesByIds } from "@/features/profiles/queries";
import { listSessions } from "@/features/sessions/queries";
import { getStudentsForParent } from "@/features/students/queries";
import type { Assignment, Profile, Session, Student } from "@/types/database";
import { isUpcoming } from "./lib/time";

export type Family = {
  children: Student[];
  assignments: Assignment[];
  sessions: Session[];
  people: Record<string, Profile>;
  now: number;
};

/** Everything a parent page needs about their children in one round of queries. */
export async function getFamily(parentId: string): Promise<Family> {
  const children = await getStudentsForParent(parentId);
  const ids = children.map((c) => c.id);
  if (!ids.length) return { children, assignments: [], sessions: [], people: {}, now: Date.now() };

  const [assignments, sessions] = await Promise.all([listAssignments({ studentIds: ids }), listSessions({ studentIds: ids })]);
  const people = await getProfilesByIds([...assignments.map((a) => a.tutor_id), ...sessions.map((s) => s.tutor_id)]);
  return { children, assignments, sessions, people, now: Date.now() };
}

export function splitSessions(sessions: Session[], now: number) {
  const upcoming = sessions.filter((s) => isUpcoming(s, now)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = sessions.filter((s) => !isUpcoming(s, now)).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  return { upcoming, past };
}

export function tutorsFor(studentId: string, family: Pick<Family, "assignments" | "people">) {
  return family.assignments
    .filter((a) => a.student_id === studentId && a.status !== "ended")
    .map((a) => ({ assignment: a, tutor: family.people[a.tutor_id] as Profile | undefined }));
}

export function currentHourIn(timezone: string) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "numeric", hourCycle: "h23" }).format(new Date()));
}

export function currentYearIn(timezone: string) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric" }).format(new Date()));
}
