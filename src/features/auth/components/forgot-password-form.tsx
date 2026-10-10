"use client";

import { useActionState, useState } from "react";
import { Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/features/auth/actions";
import type { ActionState } from "@/features/auth/schemas";
import { FormMessage } from "./form-message";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestPasswordReset, null);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="space-y-5">
      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      {state?.ok && <FormMessage tone="success">{state.message ?? "If that email exists, a reset link is on its way."}</FormMessage>}
      <Field>
        <FieldLabel htmlFor="reset-email">Email</FieldLabel>
        <Input
          id="reset-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="h-12 rounded-xl px-4 text-base md:text-base"
        />
      </Field>
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base font-semibold">
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <SendIcon aria-hidden />}
        {pending ? "Sending…" : state?.ok ? "Send again" : "Send reset link"}
      </Button>
    </form>
  );
}
