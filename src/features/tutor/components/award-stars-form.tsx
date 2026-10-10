"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2Icon, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { awardStars } from "@/features/rewards/actions";
import { cn } from "@/lib/utils";
import { awardStarsSchema } from "../schemas";

const quickReasons = ["Brilliant focus", "Homework hero", "Fantastic question", "Never gave up", "Big breakthrough"];

const burst = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return { x: Math.cos(angle) * 110, y: Math.sin(angle) * 80 - 20, rotate: (i % 2 ? 1 : -1) * (90 + i * 20), delay: i * 0.02 };
});

function Celebration({ amount, studentFirstName }: { amount: number; studentFirstName: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid place-items-center overflow-hidden rounded-3xl bg-sun/25 px-4 py-8 text-center"
      role="status"
    >
      {!reduce &&
        burst.map((b, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 text-sun"
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
            animate={{ x: b.x, y: b.y, scale: 1, opacity: 0, rotate: b.rotate }}
            transition={{ duration: 1.1, delay: b.delay, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <StarIcon className="size-5 fill-current" />
          </motion.span>
        ))}
      <motion.span
        className="grid size-16 place-items-center rounded-full bg-sun text-ink shadow-lg"
        initial={reduce ? false : { scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <StarIcon className="size-8 fill-current" />
      </motion.span>
      <p className="mt-3 font-display text-2xl font-extrabold">+{amount} for {studentFirstName}!</p>
      <p className="text-sm text-muted-foreground">They&rsquo;ll spot them in their learner space.</p>
    </motion.div>
  );
}

export function AwardStarsForm({ studentId, studentFirstName }: { studentId: string; studentFirstName: string }) {
  const router = useRouter();
  const id = useId();
  const [amount, setAmount] = useState(3);
  const [hover, setHover] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = awardStarsSchema.safeParse({ studentId, amount, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await awardStars(parsed.data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Stars sent");
      setCelebrated(parsed.data.amount);
      setReason("");
      router.refresh();
    });
  }

  const shown = hover ?? amount;

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {celebrated !== null && <Celebration key={`c-${celebrated}`} amount={celebrated} studentFirstName={studentFirstName} />}
      </AnimatePresence>

      <form onSubmit={submit} noValidate>
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">How many stars?</FieldLegend>
            <div role="group" aria-label="Number of stars" className="flex gap-1.5" onMouseLeave={() => setHover(null)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={amount === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => setAmount(n)}
                  onMouseEnter={() => setHover(n)}
                  className="rounded-xl p-1.5 transition hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <StarIcon className={cn("size-8 transition", n <= shown ? "fill-sun text-sun" : "text-muted-foreground/40")} />
                </button>
              ))}
            </div>
          </FieldSet>

          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={`${id}-reason`}>What for?</FieldLabel>
            <Input
              id={`${id}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Tell ${studentFirstName} what they did brilliantly`}
              maxLength={140}
              aria-invalid={!!error}
            />
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="rounded-full border px-2.5 py-1 text-xs transition hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {r}
                </button>
              ))}
            </div>
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Button type="submit" disabled={pending} className="h-11 rounded-full bg-sun text-ink hover:bg-sun/85">
            {pending ? <Loader2Icon className="animate-spin" /> : <StarIcon className="fill-current" />}
            Send {amount} star{amount === 1 ? "" : "s"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
