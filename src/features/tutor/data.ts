import "server-only";
import { listAssignments } from "@/features/assignments/queries";
import { getProfilesByIds } from "@/features/profiles/queries";
import { getStudentsForTutor } from "@/features/students/queries";
import type { Assignment, Profile, Student } from "@/types/database";

export type TutorRoster = {
  students: Student[];
  studentById: Record<string, Student>;
  parents: Record<string, Profile>;
  assignments: Assignment[];
  subjectsByStudent: Record<string, string[]>;
};

/** Everything a tutor page needs to label sessions: students, their parents and the subjects taught. */
export async function getTutorRoster(tutorId: string): Promise<TutorRoster> {
  const [students, assignments] = await Promise.all([getStudentsForTutor(tutorId), listAssignments({ tutorId })]);
  const parents = await getProfilesByIds(students.map((s) => s.parent_id));
  const subjectsByStudent: Record<string, string[]> = {};
  for (const a of assignments) {
    if (a.status === "ended") continue;
    (subjectsByStudent[a.student_id] ??= []).push(a.subject);
  }
  return {
    students,
    studentById: Object.fromEntries(students.map((s) => [s.id, s])),
    parents,
    assignments,
    subjectsByStudent,
  };
}

export function reportStudentOptions(roster: TutorRoster) {
  return roster.students.map((s) => ({
    id: s.id,
    name: [s.first_name, s.last_name].filter(Boolean).join(" "),
    yearGroup: s.year_group,
    subjects: roster.subjectsByStudent[s.id] ?? [],
  }));
}
