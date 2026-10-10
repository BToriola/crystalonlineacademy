"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/config/content";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { detectTimezone, noopSubscribe } from "./form-utils";

type Currency = "GBP" | "CAD";

const currencies: { value: Currency; label: string; flag: string }[] = [
  { value: "GBP", label: "GBP £", flag: "🇬🇧" },
  { value: "CAD", label: "CAD $", flag: "🇨🇦" },
];

function useDetectedCurrency(): Currency {
  return useSyncExternalStore(
    noopSubscribe,
    () => (detectTimezone()?.startsWith("America/") ? "CAD" : "GBP"),
    () => "GBP",
  );
}

export function PricingPlans({ plans }: { plans: PricingPlan[] }) {
  const detected = useDetectedCurrency();
  const [chosen, setChosen] = useState<Currency | null>(null);
  const currency = chosen ?? detected;
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Currency" className="relative inline-flex rounded-full border bg-card p-1 shadow-sm">
          {currencies.map((c) => {
            const active = currency === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setChosen(c.value)}
                className={cn(
                  "relative z-10 flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="currency-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span aria-hidden>{c.flag}</span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.price[currency];
          const lessons = plan.sessionsPerWeek * 4;
          return (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-[2rem] border p-7 sm:p-8",
                plan.featured
                  ? "border-transparent bg-primary text-primary-foreground shadow-2xl shadow-primary/30 lg:-my-4 lg:py-12"
                  : "bg-card",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 text-xs font-bold text-ink shadow-md">
                  <SparklesIcon className="size-3.5" aria-hidden /> Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-extrabold">{plan.name}</h3>
              <p className={cn("mt-1.5", plan.featured ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {plan.description}
              </p>

              <div className="mt-7 flex items-end gap-1.5" aria-live="polite">
                <span className="relative inline-flex h-16 items-end overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${plan.name}-${currency}`}
                      initial={{ y: reduce ? 0 : "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: reduce ? 0 : "-100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="text-display text-6xl"
                    >
                      {formatMoney(price, currency)}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className={cn("pb-2 text-sm", plan.featured ? "text-primary-foreground/75" : "text-muted-foreground")}>
                  / month
                </span>
              </div>
              <p className={cn("mt-2 text-sm", plan.featured ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {lessons} × {plan.minutes}-min lessons · about {formatMoney(Math.round(price / lessons), currency)} per lesson
              </p>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                        plan.featured ? "bg-white/20" : "bg-leaf/15 text-leaf dark:text-success",
                      )}
                    >
                      <CheckIcon className="size-3.5" aria-hidden />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "mt-8 h-12 w-full rounded-full px-7 text-base font-semibold",
                  plan.featured && "bg-white text-primary hover:bg-white/90",
                )}
                variant={plan.featured ? "default" : "outline"}
              >
                <Link href="/book-trial">Start with a free trial</Link>
              </Button>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
