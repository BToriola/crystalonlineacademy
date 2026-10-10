"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import { Loader2Icon, MailCheckIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryFromTimezone, homeCountries, timezones, type HomeCountry } from "@/config/site";
import { signUp } from "@/features/auth/actions";
import type { ActionState } from "@/features/auth/schemas";
import { detectTimezone, noopSubscribe } from "@/features/marketing/pages/form-utils";
import { cn } from "@/lib/utils";
import { FormMessage } from "./form-message";
import { PasswordInput } from "./password-input";

const inputClass = "h-12 rounded-xl px-4 text-base md:text-base";
const zoneLabel = (tz: string) => tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

export function SignupForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signUp, null);
  const detectedTz = useSyncExternalStore(noopSubscribe, detectTimezone, () => null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<HomeCountry | null>(null);
  const [tzChoice, setTzChoice] = useState<string | null>(null);

  const activeCountry = country ?? countryFromTimezone(detectedTz);
  const countryZone = homeCountries.find((c) => c.value === activeCountry)?.timezone ?? "Europe/London";
  const timezone = tzChoice ?? (country && country !== countryFromTimezone(detectedTz) ? countryZone : detectedTz ?? countryZone);
  const tzOptions: string[] = (timezones as readonly string[]).includes(timezone) ? [...timezones] : [timezone, ...timezones];

  if (state?.ok) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center" role="status">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheckIcon className="size-8" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold">Check your inbox</h2>
        <p className="mt-2 text-muted-foreground">
          {state.message ?? "We've sent you a confirmation link."} It was sent to <strong className="text-foreground">{email}</strong>.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Can&apos;t see it? Check your spam folder, or try again in a few minutes.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state && !state.ok && <FormMessage tone="error">{state.error}</FormMessage>}
      <input type="hidden" name="country" value={activeCountry} />
      <input type="hidden" name="timezone" value={timezone} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="signup-name">Your full name</FieldLabel>
          <Input
            id="signup-name"
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
            minLength={2}
            className={inputClass}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <PasswordInput id="signup-password" name="password" autoComplete="new-password" required minLength={8} className={inputClass} />
          <FieldDescription>At least 8 characters.</FieldDescription>
        </Field>
        <FieldSet>
          <FieldLegend variant="label">Where do you live?</FieldLegend>
          <div role="radiogroup" aria-label="Country" className="grid grid-cols-2 gap-2">
            {homeCountries.map((r) => {
              const active = activeCountry === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setCountry(r.value);
                    setTzChoice(null);
                  }}
                  className={cn(
                    "flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  <span className="text-xl" aria-hidden>
                    {r.flag}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
        </FieldSet>
        <Field>
          <FieldLabel htmlFor="signup-tz">Time zone</FieldLabel>
          <Select value={timezone} onValueChange={setTzChoice}>
            <SelectTrigger id="signup-tz" className="h-12! w-full rounded-xl px-4 text-base">
              <SelectValue>{zoneLabel(timezone)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tzOptions.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {zoneLabel(tz)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {detectedTz && !tzChoice ? "Detected from your device. " : ""}Lesson times will be shown in this zone.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-full text-base font-semibold">
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <UserPlusIcon aria-hidden />}
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
