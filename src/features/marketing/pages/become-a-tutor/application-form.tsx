"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Script } from "@/components/brand/doodles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { subjects, timezones } from "@/config/site";
import { submitTutorApplication } from "@/features/applications/actions";
import {
  applicantCountries,
  degreeClasses,
  teachingLevels,
  tutorApplicationSchema,
  type TutorApplicationInput,
} from "@/features/applications/schemas";
import { ChoiceChip } from "../choice-chip";
import { detectTimezone, fieldInputClass, fieldSelectClass, noopSubscribe, toFieldErrors, type FieldErrors } from "../form-utils";

type Values = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  subjects: string[];
  levels: string[];
  qualification: string;
  degree_class: string;
  years_experience: string;
  motivation: string;
  cv_url: string;
  consent: boolean;
};

const initial: Values = {
  full_name: "",
  email: "",
  phone: "",
  country: "",
  subjects: [],
  levels: [],
  qualification: "",
  degree_class: "",
  years_experience: "",
  motivation: "",
  cv_url: "",
  consent: false,
};

const zoneLabel = (tz: string) => tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

export function ApplicationForm() {
  const detectedTz = useSyncExternalStore(noopSubscribe, detectTimezone, () => null);
  const [values, setValues] = useState<Values>(initial);
  const [tzChoice, setTzChoice] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const timezone = tzChoice ?? detectedTz ?? "Africa/Lagos";
  const tzOptions: string[] = (timezones as readonly string[]).includes(timezone) ? [...timezones] : [timezone, ...timezones];

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggle(key: "subjects" | "levels", item: string) {
    const list = values[key];
    set(key, list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input = { ...values, timezone, consent: values.consent as true } as TutorApplicationInput;
    const parsed = tutorApplicationSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await submitTutorApplication(input);
      if (result.ok) {
        setDone(true);
        toast.success(result.message ?? "Application received");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12 text-center"
          role="status"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex size-20 items-center justify-center rounded-full bg-leaf text-white"
          >
            <CheckIcon className="size-10" aria-hidden />
          </motion.span>
          <h3 className="mt-6 text-display text-4xl">
            Thank you, <Script>{values.full_name.trim().split(/\s+/)[0] || "friend"}</Script>!
          </h3>
          <p className="mt-3 max-w-md text-lg text-muted-foreground">
            Your application is with our academic team. We review every one personally and will email you about next steps
            within five working days.
          </p>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.full_name}>
                <FieldLabel htmlFor="app-name">Full name</FieldLabel>
                <Input
                  id="app-name"
                  value={values.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!errors.full_name}
                  className={fieldInputClass}
                />
                <FieldError>{errors.full_name}</FieldError>
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="app-email">Email</FieldLabel>
                <Input
                  id="app-email"
                  type="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={fieldInputClass}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="app-phone">Phone / WhatsApp</FieldLabel>
                <Input
                  id="app-phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                  placeholder="+234 …"
                  aria-invalid={!!errors.phone}
                  className={fieldInputClass}
                />
                <FieldError>{errors.phone}</FieldError>
              </Field>
              <Field data-invalid={!!errors.country}>
                <FieldLabel htmlFor="app-country">Country you live in</FieldLabel>
                <Select value={values.country} onValueChange={(v) => set("country", v)}>
                  <SelectTrigger id="app-country" aria-invalid={!!errors.country} className={fieldSelectClass}>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent data-lenis-prevent>
                    {applicantCountries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.country}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="app-tz">Your time zone</FieldLabel>
              <Select value={timezone} onValueChange={setTzChoice}>
                <SelectTrigger id="app-tz" className={fieldSelectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent data-lenis-prevent>
                  {tzOptions.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {zoneLabel(tz)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Most lessons run 4pm–8pm UK time and after school in Canada.</FieldDescription>
            </Field>

            <FieldSet data-invalid={!!errors.subjects}>
              <FieldLegend variant="label">Subjects you can teach</FieldLegend>
              <FieldDescription>Ideally the subjects you studied at university (up to 6).</FieldDescription>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <ChoiceChip key={s} selected={values.subjects.includes(s)} onToggle={() => toggle("subjects", s)}>
                    {s}
                  </ChoiceChip>
                ))}
              </div>
              <FieldError>{errors.subjects}</FieldError>
            </FieldSet>

            <FieldSet data-invalid={!!errors.levels}>
              <FieldLegend variant="label">Levels you&apos;re confident with</FieldLegend>
              <div className="flex flex-wrap gap-2">
                {teachingLevels.map((l) => (
                  <ChoiceChip key={l} selected={values.levels.includes(l)} onToggle={() => toggle("levels", l)}>
                    {l}
                  </ChoiceChip>
                ))}
              </div>
              <FieldError>{errors.levels}</FieldError>
            </FieldSet>

            <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr_0.7fr]">
              <Field data-invalid={!!errors.qualification}>
                <FieldLabel htmlFor="app-qual">Degree & subject</FieldLabel>
                <Input
                  id="app-qual"
                  value={values.qualification}
                  onChange={(e) => set("qualification", e.target.value)}
                  placeholder="e.g. B.Sc Mathematics, UNILAG"
                  aria-invalid={!!errors.qualification}
                  className={fieldInputClass}
                />
                <FieldError>{errors.qualification}</FieldError>
              </Field>
              <Field data-invalid={!!errors.degree_class}>
                <FieldLabel htmlFor="app-class">Degree class</FieldLabel>
                <Select value={values.degree_class} onValueChange={(v) => set("degree_class", v)}>
                  <SelectTrigger id="app-class" aria-invalid={!!errors.degree_class} className={fieldSelectClass}>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent data-lenis-prevent>
                    {degreeClasses.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{errors.degree_class}</FieldError>
              </Field>
              <Field data-invalid={!!errors.years_experience}>
                <FieldLabel htmlFor="app-years">Years teaching</FieldLabel>
                <Input
                  id="app-years"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  value={values.years_experience}
                  onChange={(e) => set("years_experience", e.target.value)}
                  aria-invalid={!!errors.years_experience}
                  className={fieldInputClass}
                />
                <FieldError>{errors.years_experience}</FieldError>
              </Field>
            </div>

            <Field data-invalid={!!errors.motivation}>
              <FieldLabel htmlFor="app-why">Why do you want to teach with Crystal?</FieldLabel>
              <Textarea
                id="app-why"
                value={values.motivation}
                onChange={(e) => set("motivation", e.target.value)}
                rows={5}
                placeholder="Tell us about a child you helped, what you love about teaching and how you make lessons engaging online."
                aria-invalid={!!errors.motivation}
                className="min-h-32 rounded-xl px-4 py-3 text-base md:text-base"
              />
              <FieldDescription>{values.motivation.trim().length} / 60 characters minimum</FieldDescription>
              <FieldError>{errors.motivation}</FieldError>
            </Field>

            <Field data-invalid={!!errors.cv_url}>
              <FieldLabel htmlFor="app-cv">
                Link to your CV <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="app-cv"
                type="url"
                value={values.cv_url}
                onChange={(e) => set("cv_url", e.target.value)}
                placeholder="https://drive.google.com/…"
                aria-invalid={!!errors.cv_url}
                className={fieldInputClass}
              />
              <FieldDescription>Share a Google Drive or Dropbox link set to &ldquo;anyone with the link can view&rdquo;.</FieldDescription>
              <FieldError>{errors.cv_url}</FieldError>
            </Field>

            <Field orientation="horizontal" data-invalid={!!errors.consent} className="rounded-2xl bg-muted p-4">
              <Checkbox
                id="app-consent"
                checked={values.consent}
                onCheckedChange={(c) => set("consent", c === true)}
                aria-invalid={!!errors.consent}
              />
              <div className="flex flex-col gap-1">
                <FieldLabel htmlFor="app-consent" className="leading-relaxed font-normal">
                  The details above are accurate, and I understand successful applicants complete identity, reference and
                  safeguarding checks.
                </FieldLabel>
                <FieldError>{errors.consent}</FieldError>
              </div>
            </Field>

            <Button type="submit" disabled={pending} className="h-12 rounded-full px-7 text-base font-semibold sm:w-fit">
              {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <SendIcon aria-hidden />}
              {pending ? "Submitting…" : "Submit application"}
            </Button>
          </FieldGroup>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
