"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { yearGroups } from "@/config/site";
import { addChild } from "@/features/students/actions";
import { addChildSchema, type AddChildInput } from "../schemas";
import { curriculumFlag } from "../lib/time";

const defaults: AddChildInput = { first_name: "", last_name: "", curriculum: "uk", year_group: "", learning_notes: "" };

export function AddChildDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<AddChildInput>({ resolver: zodResolver(addChildSchema), defaultValues: defaults });
  const curriculum = useWatch({ control: form.control, name: "curriculum" });
  const groups = yearGroups[curriculum === "ca" ? "CA" : "UK"];

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await addChild(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Child added.");
      form.reset(defaults);
      setOpen(false);
    }),
  );

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-full">
            <PlusIcon data-icon="inline-start" /> Add a child
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Add a child</DialogTitle>
          <DialogDescription>Tell us a little about them so we can match the right tutor.</DialogDescription>
        </DialogHeader>
        <form id="add-child-form" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel htmlFor="child-first-name">First name</FieldLabel>
                <Input id="child-first-name" autoComplete="off" aria-invalid={!!errors.first_name} {...form.register("first_name")} />
                <FieldError errors={[errors.first_name]} />
              </Field>
              <Field data-invalid={!!errors.last_name}>
                <FieldLabel htmlFor="child-last-name">Last name (optional)</FieldLabel>
                <Input id="child-last-name" autoComplete="off" {...form.register("last_name")} />
                <FieldError errors={[errors.last_name]} />
              </Field>
            </div>

            <Field>
              <FieldLabel id="child-curriculum-label">Curriculum</FieldLabel>
              <Controller
                control={form.control}
                name="curriculum"
                render={({ field }) => (
                  <RadioGroup
                    aria-labelledby="child-curriculum-label"
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("year_group", "");
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(["uk", "ca"] as const).map((c) => (
                      <FieldLabel key={c} htmlFor={`curriculum-${c}`}>
                        <Field orientation="horizontal">
                          <RadioGroupItem value={c} id={`curriculum-${c}`} />
                          <span>
                            <span aria-hidden>{curriculumFlag[c].flag}</span> {c === "uk" ? "UK" : "Canada"}
                          </span>
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                )}
              />
            </Field>

            <Field data-invalid={!!errors.year_group}>
              <FieldLabel htmlFor="child-year-group">{curriculum === "ca" ? "Grade" : "Year group"}</FieldLabel>
              <Controller
                control={form.control}
                name="year_group"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="child-year-group" className="w-full" aria-invalid={!!errors.year_group}>
                      <SelectValue placeholder={curriculum === "ca" ? "Choose a grade" : "Choose a year group"} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {groups.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.year_group]} />
            </Field>

            <Field data-invalid={!!errors.learning_notes}>
              <FieldLabel htmlFor="child-notes">Learning notes (optional)</FieldLabel>
              <Textarea
                id="child-notes"
                rows={3}
                placeholder="What do they enjoy? Anything they find tricky? Any SEN or access needs?"
                {...form.register("learning_notes")}
              />
              <FieldDescription>Only shared with your child&apos;s tutor and our team.</FieldDescription>
              <FieldError errors={[errors.learning_notes]} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="add-child-form" className="rounded-full" disabled={pending}>
            {pending ? "Adding…" : "Add child"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
