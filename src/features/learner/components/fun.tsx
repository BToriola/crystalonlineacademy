"use client";

import { motion, useReducedMotion } from "motion/react";
import { FlameIcon, StarIcon } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/utils";
import type { StarItem } from "../types";

const spring = { type: "spring", stiffness: 380, damping: 18 } as const;

export function StarCounter({ stars, className }: { stars: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("flex items-center gap-3 rounded-3xl bg-card/90 px-5 py-3 shadow-lg shadow-ink/5", className)}>
      <motion.span
        aria-hidden
        className="grid size-12 place-items-center rounded-2xl bg-sun text-ink"
        animate={reduce ? undefined : { rotate: [0, -12, 12, -6, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3.5 }}
      >
        <StarIcon className="size-7 fill-current" />
      </motion.span>
      <div>
        <p className="font-display text-3xl leading-none font-extrabold tabular-nums">
          <CountUp to={stars} />
        </p>
        <p className="text-sm font-medium text-muted-foreground">stars collected</p>
      </div>
    </div>
  );
}

export function StreakFlame({ days, className }: { days: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("flex items-center gap-3 rounded-3xl bg-card/90 px-5 py-3 shadow-lg shadow-ink/5", className)}>
      <motion.span
        aria-hidden
        className="grid size-12 place-items-center rounded-2xl bg-coral text-white"
        animate={reduce ? undefined : { scale: [1, 1.12, 0.96, 1.08, 1], y: [0, -2, 0, -1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <FlameIcon className="size-7 fill-sun/70" />
      </motion.span>
      <div>
        <p className="font-display text-3xl leading-none font-extrabold tabular-nums">{days}</p>
        <p className="text-sm font-medium text-muted-foreground">day streak{days >= 3 ? " — on fire!" : ""}</p>
      </div>
    </div>
  );
}

export function ProgressRing({
  current,
  target,
  emoji,
  size = 132,
  label,
}: {
  current: number;
  target: number;
  emoji: string;
  size?: number;
  label: string;
}) {
  const reduce = useReducedMotion();
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  const stroke = 12;
  const r = (size - stroke) / 2;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-leaf"
          initial={{ pathLength: reduce ? pct : 0 }}
          whileInView={{ pathLength: pct }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <motion.span
        aria-hidden
        className="absolute text-5xl"
        initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ ...spring, delay: 0.4 }}
      >
        {emoji}
      </motion.span>
    </div>
  );
}

export function StarFeed({ items }: { items: StarItem[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: i * 0.09 }}
          className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-foreground/5"
        >
          <span className="inline-flex h-10 min-w-14 shrink-0 items-center justify-center gap-1 rounded-xl bg-sun/30 px-2 font-display text-lg font-extrabold text-ink dark:text-sun">
            +{item.amount}
            <StarIcon className="size-4 fill-current" aria-hidden />
            <span className="sr-only">stars</span>
          </span>
          <span className="flex-1 font-medium">{item.reason}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{item.when}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export function Bounce({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, stiffness: 260, damping: 22, delay }}
    >
      {children}
    </motion.div>
  );
}
