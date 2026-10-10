"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Script } from "@/components/brand/doodles";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { regions, siteConfig, subjects, timezones, yearGroups, type Region } from "@/config/site";
import { submitTrialRequest } from "@/features/leads/actions";
import {
  trialChildSchema,
  trialGoalsSchema,
  trialParentSchema,
  trialRegionSchema,
  trialRequestSchema,
  type TrialRequestInput,
} from "@/features/leads/schemas";
import { shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChoiceChip } from "../choice-chip";
import { detectTimezone, fieldInputClass, fieldSelectClass, noopSubscribe, toFieldErrors, type FieldErrors } from "../form-utils";
import { ConfettiBurst } from "./confetti-burst";

const steps = [
  { title: "Where you are", short: "Region" },
  { title: "About your child", short: "Child" },
  { title: "Goals & timing", short: "Goals" },
  { title: "Your details", short: "You" },
] as const;

const stepSchemas = [trialRegionSchema, trialChildSchema, trialGoalsSchema, trialParentSchema] as const;

const timeSlots = ["Weekdays after school", "Weekday evenings", "Saturday mornings", "Saturday afternoons", "Sundays"];
const heardFromOptions = ["Google", "Instagram", "Facebook", "WhatsApp group", "Friend or family", "School or church community", "Other"];

type Values = {
  country: Region | "";
  child_name: string;
  year_group: string;
  subjects: string[];
  goals: string;
  slots: string[];
  time_notes: string;
  heard_from: string;
  parent_name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const initialValues: Values = {
  country: "",
  child_name: "",
  year_group: "",
  subjects: [],
  goals: "",
  slots: [],
  time_notes: "",
  heard_from: "",
  parent_name: "",
  email: "",
  phone: "",
  consent: false,
};

const zoneLabel = (tz: string) => tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

export function TrialForm({ tutor }: { tutor: { id: string; name: string } | null }) {
  const reduce = useReducedMotion();
  const detectedTz = useSyncExternalStore(noopSubscribe, detectTimezone, () => null);
  const [values, setValues] = useState<Values>(initialValues);
  const [tzChoice, setTzChoice] = useState<string | null>(null);
  const [requestedTutor, setRequestedTutor] = useState(tutor);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const regionDefault = regions.find((r) => r.value === values.country)?.timezone;
  const timezone = tzChoice ?? detectedTz ?? regionDefault ?? "Europe/London";
  const tzOptions: string[] = (timezones as readonly string[]).includes(timezone) ? [...timezones] : [timezone, ...timezones];

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleIn(key: "subjects" | "slots", item: string) {
    const list = values[key];
    set(key, list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  function chooseRegion(country: Region) {
    setValues((v) => ({
      ...v,
      country,
      year_group: (yearGroups[country] as readonly string[]).includes(v.year_group) ? v.year_group : "",
    }));
    setErrors((e) => ({ ...e, country: undefined }));
  }

  function payload(): TrialRequestInput {
    const preferred = [...values.slots, values.time_notes.trim()].filter(Boolean).join("; ");
    return {
      country: values.country as Region,
      timezone,
      child_name: values.child_name,
      year_group: values.year_group,
      subjects: values.subjects,
      goals: values.goals,
      preferred_times: preferred ? `${preferred} (${zoneLabel(timezone)} time)` : "",
      heard_from: values.heard_from,
      parent_name: values.parent_name,
      email: values.email,
      phone: values.phone,
      consent: values.consent as true,
      tutor_id: requestedTutor?.id,
    };
  }

  function validateStep(index: number) {
    const parsed = stepSchemas[index].safeParse(payload());
    if (parsed.success) {
      setErrors({});
      return true;
    }
    setErrors(toFieldErrors(parsed.error));
    return false;
  }

  function go(to: number) {
    setDirection(to > step ? 1 : -1);
    setStep(to);
  }

  function next() {
    if (validateStep(step)) go(step + 1);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step < steps.length - 1) return next();
    const parsed = trialRequestSchema.safeParse(payload());
    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      const firstBadStep = stepSchemas.findIndex((s) => Object.keys(s.shape).some((k) => fieldErrors[k]));
      if (firstBadStep >= 0 && firstBadStep !== step) go(firstBadStep);
      return;
    }
    startTransition(async () => {
      const result = await submitTrialRequest(payload());
      if (result.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else {
        toast.error(result.error);
      }
    });
  }

  if (done) {
    return <SuccessScreen parentName={values.parent_name} childName={values.child_name} />;
  }

  const slide = {
    enter: (d: number) => ({ x: reduce ? 0 : d * 48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduce ? 0 : d * -48, opacity: 0 }),
  };

  const years = values.country ? yearGroups[values.country] : [];

  return (
    <form onSubmit={submit} noValidate className="overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-ink/5">
      <div className="border-b p-5 sm:p-8">
        <ol className="grid grid-cols-4 gap-2" aria-label="Form progress">
          {steps.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "upcoming";
            return (
              <li key={s.title} aria-current={state === "current" ? "step" : undefined}>
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && go(i)}
                  className="group flex w-full flex-col items-center gap-2 rounded-xl text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default sm:flex-row sm:text-left"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                      state === "done" && "border-leaf bg-leaf text-white",
                      state === "current" && "border-primary bg-primary text-primary-foreground",
                      state === "upcoming" && "border-border text-muted-foreground",
                    )}
                  >
                    {state === "done" ? <CheckIcon className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <span className={cn("text-xs font-semibold sm:text-sm", state === "upcoming" && "text-muted-foreground")}>
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-primary to-coral"
            initial={false}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          Step {step + 1} of {steps.length}: {steps[step].title}
        </p>
      </div>

      {requestedTutor && (
        <div className="mx-5 mt-5 flex items-center gap-3 rounded-2xl bg-sun/30 px-4 py-3 text-sm sm:mx-8">
          <SparklesIcon className="size-4 shrink-0 text-coral" aria-hidden />
          <p className="flex-1">
            You&apos;ve asked for <strong>{requestedTutor.name}</strong>. We&apos;ll check their availability first.
          </p>
          <button
            type="button"
            onClick={() => setRequestedTutor(null)}
            className="rounded-full p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
            aria-label="Remove tutor request"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      <div className="relative p-5 sm:p-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="mb-6 font-display text-2xl font-extrabold sm:text-3xl">{steps[step].title}</h2>

            {step === 0 && (
              <FieldGroup>
                <FieldSet data-invalid={!!errors.country}>
                  <FieldLegend variant="label">Where does your family live?</FieldLegend>
                  <div role="radiogroup" aria-label="Region" className="grid gap-3 sm:grid-cols-2">
                    {regions.map((r) => {
                      const active = values.country === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => chooseRegion(r.value)}
                          className={cn(
                            "relative flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/50",
                          )}
                        >
                          <span className="text-5xl leading-none" aria-hidden>
                            {r.flag}
                          </span>
                          <span>
                            <span className="block font-display text-lg font-bold">{r.label}</span>
                            <span className="block text-sm text-muted-foreground">
                              {r.value === "UK" ? "National Curriculum · EYFS to GCSE" : "Provincial curricula · Pre-K to Grade 12"}
                            </span>
                          </span>
                          {active && (
                            <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckIcon className="size-3.5" aria-hidden />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError>{errors.country}</FieldError>
                </FieldSet>

                <Field data-invalid={!!errors.timezone}>
                  <FieldLabel htmlFor="trial-tz">Your time zone</FieldLabel>
                  <Select value={timezone} onValueChange={setTzChoice}>
                    <SelectTrigger id="trial-tz" className={fieldSelectClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent data-lenis-prevent>
                      {tzOptions.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {zoneLabel(tz)} ({shortZone(tz)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {detectedTz && !tzChoice ? "We detected this from your device. " : ""}Lesson times will always be shown in this time zone.
                  </FieldDescription>
                  <FieldError>{errors.timezone}</FieldError>
                </Field>
              </FieldGroup>
            )}

            {step === 1 && (
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={!!errors.child_name}>
                    <FieldLabel htmlFor="trial-child">Child&apos;s first name</FieldLabel>
                    <Input
                      id="trial-child"
                      value={values.child_name}
                      onChange={(e) => set("child_name", e.target.value)}
                      aria-invalid={!!errors.child_name}
                      className={fieldInputClass}
                      autoComplete="off"
                    />
                    <FieldError>{errors.child_name}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.year_group}>
                    <FieldLabel htmlFor="trial-year">{values.country === "CA" ? "Grade" : "Year group"}</FieldLabel>
                    <Select value={values.year_group} onValueChange={(v) => set("year_group", v)}>
                      <SelectTrigger id="trial-year" aria-invalid={!!errors.year_group} className={fieldSelectClass}>
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent data-lenis-prevent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{errors.year_group}</FieldError>
                  </Field>
                </div>
                <FieldSet data-invalid={!!errors.subjects}>
                  <FieldLegend variant="label">Which subjects would help most?</FieldLegend>
                  <FieldDescription>Choose as many as you like.</FieldDescription>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <ChoiceChip key={s} selected={values.subjects.includes(s)} onToggle={() => toggleIn("subjects", s)}>
                        {s}
                      </ChoiceChip>
                    ))}
                  </div>
                  <FieldError>{errors.subjects}</FieldError>
                </FieldSet>
              </FieldGroup>
            )}

            {step === 2 && (
              <FieldGroup>
                <Field data-invalid={!!errors.goals}>
                  <FieldLabel htmlFor="trial-goals">What would success look like?</FieldLabel>
                  <Textarea
                    id="trial-goals"
                    value={values.goals}
                    onChange={(e) => set("goals", e.target.value)}
                    rows={4}
                    placeholder={`e.g. ${values.child_name || "Maya"} finds fractions tricky and gets anxious before tests. We'd love more confidence before SATs.`}
                    className="min-h-28 rounded-xl px-4 py-3 text-base md:text-base"
                  />
                  <FieldError>{errors.goals}</FieldError>
                </Field>
                <FieldSet>
                  <FieldLegend variant="label">When suits you best?</FieldLegend>
                  <FieldDescription>In your local time ({zoneLabel(timezone)}).</FieldDescription>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot) => (
                      <ChoiceChip key={slot} selected={values.slots.includes(slot)} onToggle={() => toggleIn("slots", slot)}>
                        {slot}
                      </ChoiceChip>
                    ))}
                  </div>
                  <Input
                    aria-label="Anything else about timing"
                    value={values.time_notes}
                    onChange={(e) => set("time_notes", e.target.value)}
                    placeholder="Anything else? e.g. not Wednesdays, after 5pm"
                    className={fieldInputClass}
                  />
                </FieldSet>
                <FieldSet>
                  <FieldLegend variant="label">How did you hear about us?</FieldLegend>
                  <div className="flex flex-wrap gap-2">
                    {heardFromOptions.map((opt) => (
                      <ChoiceChip
                        key={opt}
                        selected={values.heard_from === opt}
                        onToggle={() => set("heard_from", values.heard_from === opt ? "" : opt)}
                      >
                        {opt}
                      </ChoiceChip>
                    ))}
                  </div>
                </FieldSet>
              </FieldGroup>
            )}

            {step === 3 && (
              <FieldGroup>
                <Field data-invalid={!!errors.parent_name}>
                  <FieldLabel htmlFor="trial-parent">Your full name</FieldLabel>
                  <Input
                    id="trial-parent"
                    value={values.parent_name}
                    onChange={(e) => set("parent_name", e.target.value)}
                    autoComplete="name"
                    aria-invalid={!!errors.parent_name}
                    className={fieldInputClass}
                  />
                  <FieldError>{errors.parent_name}</FieldError>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="trial-email">Email</FieldLabel>
                    <Input
                      id="trial-email"
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
                    <FieldLabel htmlFor="trial-phone">
                      Phone / WhatsApp <span className="font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      id="trial-phone"
                      type="tel"
                      value={values.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      autoComplete="tel"
                      placeholder={values.country === "CA" ? "+1 …" : "+44 …"}
                      aria-invalid={!!errors.phone}
                      className={fieldInputClass}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </Field>
                </div>
                <Field orientation="horizontal" data-invalid={!!errors.consent} className="rounded-2xl bg-muted p-4">
                  <Checkbox
                    id="trial-consent"
                    checked={values.consent}
                    onCheckedChange={(c) => set("consent", c === true)}
                    aria-invalid={!!errors.consent}
                  />
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor="trial-consent" className="leading-relaxed font-normal">
                      I&apos;m the parent or guardian and I&apos;m happy for Crystal Online Academy to contact me about this trial.
                      See our{" "}
                      <Link href="/privacy" className="font-medium text-primary underline underline-offset-4">
                        privacy policy
                      </Link>
                      .
                    </FieldLabel>
                    <FieldError>{errors.consent}</FieldError>
                  </div>
                </Field>
              </FieldGroup>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t bg-muted/40 p-5 sm:px-8">
        {step > 0 ? (
          <Button type="button" variant="ghost" className="h-12 rounded-full px-5" onClick={() => go(step - 1)}>
            <ArrowLeftIcon aria-hidden /> Back
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">Takes about 2 minutes</span>
        )}
        {step < steps.length - 1 ? (
          <Button type="submit" className="h-12 rounded-full px-7 text-base font-semibold">
            Continue <ArrowRightIcon aria-hidden />
          </Button>
        ) : (
          <Button type="submit" disabled={pending} className="h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-primary/25">
            {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <SparklesIcon aria-hidden />}
            {pending ? "Sending…" : "Book my free trial"}
          </Button>
        )}
      </div>
    </form>
  );
}

function SuccessScreen({ parentName, childName }: { parentName: string; childName: string }) {
  const firstName = parentName.trim().split(/\s+/)[0];
  const nextSteps = [
    { title: "We'll be in touch within 24 hours", body: "A member of our team will call, email or WhatsApp to learn a little more." },
    { title: `We hand-pick ${childName.trim() || "your child"}'s tutor`, body: "Matched on personality and learning style, not just the subject." },
    { title: "Your free 30-minute trial", body: "Booked at a time that suits you, shown in your own time zone." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[2rem] border bg-card p-6 text-center shadow-xl shadow-ink/5 sm:p-12"
      role="status"
    >
      <ConfettiBurst />
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
        className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-leaf text-white shadow-lg"
      >
        <CheckIcon className="size-10" aria-hidden />
      </motion.span>
      <h2 className="mt-6 text-display text-4xl text-balance sm:text-5xl">
        You&apos;re all set{firstName ? `, ${firstName}` : ""}! <Script>Yay!</Script>
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
        Thank you for trusting us. Here&apos;s what happens next.
      </p>

      <ol className="mx-auto mt-10 grid max-w-3xl gap-4 text-left md:grid-cols-3">
        {nextSteps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.12 }}
            className="rounded-3xl bg-muted p-5"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
            <h3 className="mt-3 font-display font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild className="h-12 rounded-full bg-leaf px-7 text-base font-semibold text-white hover:bg-leaf/90">
          <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon className="size-5" /> Message us on WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-full px-7 text-base">
          <Link href="/tutors">Meet our tutors</Link>
        </Button>
      </div>
    </motion.div>
  );
}
