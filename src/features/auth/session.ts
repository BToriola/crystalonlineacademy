import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { demoAdmin, demoParent, demoStudentProfile, demoTutor } from "@/lib/demo/data";
import type { Profile, Role } from "@/types/database";
import { DEMO_ROLE_COOKIE, roleHome } from "./constants";

const demoProfiles: Record<Role, Profile> = {
  admin: demoAdmin,
  tutor: demoTutor,
  parent: demoParent,
  student: demoStudentProfile,
};

export const getCurrentUser = cache(async (): Promise<Profile | null> => {
  if (isDemoMode) {
    const role = (await cookies()).get(DEMO_ROLE_COOKIE)?.value as Role | undefined;
    return role && role in demoProfiles ? demoProfiles[role] : null;
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return (data as Profile | null) ?? null;
});

/** Guards a server component or action. Redirects away if the role doesn't match. */
export async function requireUser(...roles: Role[]): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(roleHome[user.role]);
  return user;
}
