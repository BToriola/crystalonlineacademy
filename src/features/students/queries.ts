import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoAssignments, demoStudents } from "@/lib/demo/data";
import type { Student } from "@/types/database";

export async function listStudents(): Promise<Student[]> {
  if (isDemoMode) return demoStudents;
  const supabase = await createClient();
  const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Student[];
}

export async function getStudentsForParent(parentId: string): Promise<Student[]> {
  if (isDemoMode) return demoStudents.filter((s) => s.parent_id === parentId);
  const supabase = await createClient();
  const { data } = await supabase.from("students").select("*").eq("parent_id", parentId).order("created_at");
  return (data ?? []) as Student[];
}

export async function getStudentsForTutor(tutorId: string): Promise<Student[]> {
  if (isDemoMode) {
    const ids = new Set(demoAssignments.filter((a) => a.tutor_id === tutorId && a.status !== "ended").map((a) => a.student_id));
    return demoStudents.filter((s) => ids.has(s.id));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("assignments")
    .select("student:students(*)")
    .eq("tutor_id", tutorId)
    .neq("status", "ended");
  const rows = (data ?? []) as unknown as { student: Student }[];
  return [...new Map(rows.map((r) => [r.student.id, r.student])).values()];
}

export async function getStudent(id: string): Promise<Student | null> {
  if (isDemoMode) return demoStudents.find((s) => s.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  return (data as Student | null) ?? null;
}

export async function getStudentForProfile(profileId: string): Promise<Student | null> {
  if (isDemoMode) return demoStudents.find((s) => s.profile_id === profileId) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("students").select("*").eq("profile_id", profileId).maybeSingle();
  return (data as Student | null) ?? null;
}
