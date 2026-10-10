"use client";

import { motion, useReducedMotion } from "motion/react";
import { levelFor, levels } from "../levels";

export function LevelBar({ stars }: { stars: number }) {
  const reduce = useReducedMotion();
  const level = levelFor(stars);
  return (
    <section aria-labelledby="level-title" className="slab relative overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
      <div aria-hidden className="absolute -top-16 -right-10 size-56 rounded-full bg-white/10" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <motion.span
            aria-hidden
            className="grid size-20 place-items-center rounded-3xl bg-white/15 text-5xl"
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {level.emoji}
          </motion.span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary-foreground/75 uppercase">Level {level.number}</p>
            <h2 id="level-title" className="font-display text-4xl font-extrabold tracking-tight">
              {level.name}
            </h2>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="h-5 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(level.progress * 100)}
            aria-label={level.next ? `Progress to ${level.next.name}` : "Top level reached"}
          >
            <motion.div
              className="h-full rounded-full bg-sun"
              initial={{ width: reduce ? `${level.progress * 100}%` : "0%" }}
              whileInView={{ width: `${Math.max(4, level.progress * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
          <p className="text-lg font-semibold">
            {level.next
              ? `${level.starsToNext} more star${level.starsToNext === 1 ? "" : "s"} to become ${/^[AEIOU]/.test(level.next.name) ? "an" : "a"} ${level.next.name} ${level.next.emoji}`
              : "You're a Legend — the very top level! 👑"}
          </p>
        </div>

        <ol className="flex flex-wrap gap-2" aria-label="All levels">
          {levels.map((l, i) => (
            <li
              key={l.name}
              className={
                i + 1 <= level.number
                  ? "rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary"
                  : "rounded-full bg-white/10 px-3 py-1 text-sm text-primary-foreground/70"
              }
            >
              <span aria-hidden>{l.emoji}</span> {l.name} <span className="sr-only">{i + 1 <= level.number ? "(reached)" : "(locked)"}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
