"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LocateFixedIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timezones } from "@/config/site";
import { useNow } from "@/features/tutor/components/use-now";
import { formatInZone, shortZone } from "@/lib/format";
import { updateProfile } from "../actions";
import { countries, profileSchema, type ProfileValues } from "../schemas";

const zoneName = (tz: string) => tz.split("/").pop()!.replace(/_/g, " ");

export function ProfileForm({ initial, email }: { initial: ProfileValues; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: initial });
  const errors = form.formState.errors;
  const now = useNow();
  const timezone = useWatch({ control: form.control, name: "timezone" });
  const zoneOptions = timezones.includes(timezone as (typeof timezones)[number]) ? [...timezones] : [...timezones, timezone];

  function detect() {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) {
      toast.error("We couldn't detect your time zone — please pick it from the list.");
      return;
    }
    form.setValue("timezone", detected, { shouldDirty: true });
    toast.success(`Detected ${zoneName(detected)} (${shortZone(detected)})`);
  }

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateProfile(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Profile updated");
      form.reset(values);
      router.refresh();
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.full_name}>
            <FieldLabel htmlFor="settings-name">Full name</FieldLabel>
            <Input id="settings-name" autoComplete="name" aria-invalid={!!errors.full_name} {...form.register("full_name")} />
            <FieldError errors={[errors.full_name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-email">Email</FieldLabel>
            <Input id="settings-email" value={email} disabled readOnly />
            <FieldDescription>Contact the academy to change your login email.</FieldDescription>
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="settings-phone">Phone / WhatsApp</FieldLabel>
            <Input id="settings-phone" type="tel" autoComplete="tel" placeholder="+44 7700 900123" aria-invalid={!!errors.phone} {...form.register("phone")} />
            <FieldError errors={[errors.phone]} />
          </Field>
          <Controller
            control={form.control}
            name="country"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="settings-country">Country</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="settings-country" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="timezone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="settings-tz">Time zone</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="settings-tz" className="w-full sm:flex-1">
                    <SelectValue placeholder="Choose your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneOptions.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {zoneName(tz)} · {shortZone(tz)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" className="rounded-full" onClick={detect}>
                  <LocateFixedIcon /> Detect my time zone
                </Button>
              </div>
              <FieldDescription>
                Every lesson time in the app is shown in this zone{now !== null && <> — it&rsquo;s {formatInZone(new Date(now), field.value, "h:mm a")} there now</>}.
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="h-11 rounded-full px-6" disabled={pending || !form.formState.isDirty}>
            {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />} Save profile
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
