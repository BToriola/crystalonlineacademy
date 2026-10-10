"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, Loader2Icon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { subjects } from "@/config/site";
import { cn } from "@/lib/utils";
import { updateTutorProfile } from "../actions";
import { tutorLevels, tutorProfileSchema, type TutorProfileValues } from "../schemas";

function ChipGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  const all = [...new Set([...options, ...value])];
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {all.map((o) => {
        const selected = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? value.filter((v) => v !== o) : [...value, o])}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              selected ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {selected && <CheckIcon className="size-3.5" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

function LanguagesInput({ value, onChange, invalid }: { value: string[]; onChange: (v: string[]) => void; invalid?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const next = draft.trim();
    if (next && !value.some((v) => v.toLowerCase() === next.toLowerCase())) onChange([...value, next]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {value.map((lang) => (
          <li key={lang} className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-sm">
            {lang}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== lang))}
              className="grid size-5 place-items-center rounded-full hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={`Remove ${lang}`}
            >
              <XIcon className="size-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          id="tutor-languages"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. French"
          aria-invalid={invalid}
          className="max-w-xs"
        />
        <Button type="button" variant="outline" onClick={add} disabled={!draft.trim()}>
          <PlusIcon /> Add
        </Button>
      </div>
    </div>
  );
}

export function TutorProfileForm({ initial }: { initial: TutorProfileValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<TutorProfileValues>({ resolver: zodResolver(tutorProfileSchema), defaultValues: initial });
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateTutorProfile(values);
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
        <Field data-invalid={!!errors.headline}>
          <FieldLabel htmlFor="tutor-headline">Headline</FieldLabel>
          <Input id="tutor-headline" placeholder="e.g. Maths that finally clicks" maxLength={80} aria-invalid={!!errors.headline} {...form.register("headline")} />
          <FieldError errors={[errors.headline]} />
        </Field>

        <Field data-invalid={!!errors.bio}>
          <FieldLabel htmlFor="tutor-bio">About you</FieldLabel>
          <Textarea id="tutor-bio" rows={5} maxLength={1200} aria-invalid={!!errors.bio} {...form.register("bio")} />
          <FieldDescription>What&rsquo;s it like to learn with you? Parents read this before a trial.</FieldDescription>
          <FieldError errors={[errors.bio]} />
        </Field>

        <Controller
          control={form.control}
          name="subjects"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">Subjects</FieldLegend>
              <ChipGroup label="Subjects" options={subjects} value={field.value} onChange={field.onChange} />
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <Controller
          control={form.control}
          name="levels"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">Levels</FieldLegend>
              <ChipGroup label="Levels" options={tutorLevels} value={field.value} onChange={field.onChange} />
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <Field data-invalid={!!errors.qualification}>
          <FieldLabel htmlFor="tutor-qualification">Highest qualification</FieldLabel>
          <Input id="tutor-qualification" placeholder="e.g. B.Sc Mathematics (First Class)" {...form.register("qualification")} />
          <FieldError errors={[errors.qualification]} />
        </Field>

        <Controller
          control={form.control}
          name="languages"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tutor-languages">Languages you teach in</FieldLabel>
              <LanguagesInput value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="h-11 rounded-full px-6" disabled={pending || !form.formState.isDirty}>
            {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />} Save public profile
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
