import "server-only";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoTutors } from "@/lib/demo/data";
import type { Tutor } from "@/types/database";

const tutorSelect = "*, tutor:tutor_profiles!inner(*)";

export async function listPublishedTutors(): Promise<Tutor[]> {
  if (isDemoMode) return demoTutors.filter((t) => t.tutor.is_published);
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(tutorSelect).in("role", ["tutor", "admin"]).eq("tutor.is_published", true);
  return (data ?? []) as Tutor[];
}

export async function listAllTutors(): Promise<Tutor[]> {
  if (isDemoMode) return demoTutors;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(tutorSelect).in("role", ["tutor", "admin"]).order("full_name");
  return (data ?? []) as Tutor[];
}

export async function getTutor(id: string): Promise<Tutor | null> {
  if (isDemoMode) return demoTutors.find((t) => t.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(tutorSelect).eq("id", id).maybeSingle();
  return (data as Tutor | null) ?? null;
}
