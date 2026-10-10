"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { passwordSchema, type PasswordValues } from "../schemas";

export function PasswordForm({ live }: { live: boolean }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirm: "" } });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      if (!live) {
        toast.success("Password updated (demo mode — nothing was changed).");
        form.reset();
        return;
      }
      const { error } = await createClient().auth.updateUser({ password: values.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated. Use it next time you sign in.");
      form.reset();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input id="new-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...form.register("password")} />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={!!errors.confirm}>
            <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
            <Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...form.register("confirm")} />
            <FieldError errors={[errors.confirm]} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" className="h-11 rounded-full px-6" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : <KeyRoundIcon />} Change password
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
