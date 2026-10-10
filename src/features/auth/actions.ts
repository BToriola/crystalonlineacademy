"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/database";
import { DEMO_ROLE_COOKIE, roleHome } from "./constants";
import { loginSchema, resetSchema, signupSchema, type ActionState } from "./schemas";

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (isDemoMode) {
    return { ok: false, error: "Supabase isn't connected yet — use one of the demo accounts below." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (isDemoMode) {
    return { ok: false, error: "Supabase isn't connected yet — explore with a demo account instead." };
  }

  const { email, password, full_name, country, timezone } = parsed.data;
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, country, timezone },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true, message: "Check your inbox to confirm your email address." };
}

export async function requestPasswordReset(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (isDemoMode) return { ok: true, message: "Demo mode: no email was sent." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/settings`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "If that email exists, a reset link is on its way." };
}

export async function signInAsDemo(role: Role) {
  if (!isDemoMode) return;
  (await cookies()).set(DEMO_ROLE_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
  redirect(roleHome[role]);
}

export async function signOut() {
  if (isDemoMode) {
    (await cookies()).delete(DEMO_ROLE_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
