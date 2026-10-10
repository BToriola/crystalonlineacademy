"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2Icon, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/features/auth/actions";
import type { ActionState } from "@/features/auth/schemas";
import { FormMessage } from "./form-message";
import { PasswordInput } from "./password-input";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, null);
  // Controlled so the email survives React's automatic form reset after a failed attempt.
  const [email, setEmail] = useState("");
  const error = state && !state.ok ? state.error : state === null ? initialError : undefined;

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!error}
            className="h-12 rounded-xl px-4 text-base md:text-base"
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            required
            minLength={6}
            aria-invalid={!!error}
            className="h-12 rounded-xl px-4 text-base md:text-base"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base font-semibold">
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <LogInIcon aria-hidden />}
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
