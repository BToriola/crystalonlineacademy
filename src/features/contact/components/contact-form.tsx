"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2Icon, Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fieldInputClass, fieldSelectClass, toFieldErrors, type FieldErrors } from "@/features/marketing/pages/form-utils";
import { submitContactMessage } from "../actions";
import { contactSchema, contactTopics } from "../schemas";

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [topic, setTopic] = useState<string>("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse({ ...data, topic });
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await submitContactMessage(parsed.data);
      if (result.ok) {
        toast.success(result.message ?? "Message sent");
        form.reset();
        setTopic("");
        setSent(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center py-12 text-center"
          role="status"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-leaf/15 text-leaf dark:text-success">
            <CheckCircle2Icon className="size-8" aria-hidden />
          </span>
          <h3 className="mt-5 font-display text-2xl font-extrabold">Message sent!</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Thank you. A real person will reply within one working day, usually much sooner.
          </p>
          <Button variant="outline" className="mt-6 h-11 rounded-full px-6" onClick={() => setSent(false)}>
            Send another message
          </Button>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="contact-name">Your name</FieldLabel>
                <Input id="contact-name" name="name" autoComplete="name" aria-invalid={!!errors.name} className={fieldInputClass} />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={fieldInputClass}
                />
                <FieldError>{errors.email}</FieldError>
              </Field>
            </div>
            <Field data-invalid={!!errors.topic}>
              <FieldLabel htmlFor="contact-topic">What&apos;s it about?</FieldLabel>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger id="contact-topic" aria-invalid={!!errors.topic} className={fieldSelectClass}>
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent data-lenis-prevent>
                  {contactTopics.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{errors.topic}</FieldError>
            </Field>
            <Field data-invalid={!!errors.message}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                id="contact-message"
                name="message"
                rows={6}
                aria-invalid={!!errors.message}
                placeholder="How can we help?"
                className="min-h-36 rounded-xl px-4 py-3 text-base md:text-base"
              />
              <FieldError>{errors.message}</FieldError>
            </Field>
            <Button type="submit" disabled={pending} className="h-12 rounded-full px-7 text-base font-semibold sm:w-fit">
              {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : <SendIcon aria-hidden />}
              {pending ? "Sending…" : "Send message"}
            </Button>
          </FieldGroup>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
