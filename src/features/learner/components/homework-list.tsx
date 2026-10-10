"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { CheckIcon, PartyPopperIcon } from "lucide-react";
import { toast } from "sonner";
import { toggleHomework } from "@/features/sessions/learner-actions";
import { cn } from "@/lib/utils";
import type { HomeworkItem } from "../types";

const confettiColours = ["bg-coral", "bg-sun", "bg-leaf", "bg-sky", "bg-blush", "bg-primary"];

type BurstState = { id: number; x: number; y: number };

function Burst({ burst, onDone }: { burst: BurstState; onDone: () => void }) {
  const pieces = 18;
  return (
    <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: burst.x, top: burst.y }}>
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
        const distance = 60 + ((i * 37) % 50);
        return (
          <motion.span
            key={i}
            className={cn("absolute size-2.5", i % 3 ? "rounded-full" : "rounded-[2px]", confettiColours[i % confettiColours.length])}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 30,
              scale: [0.4, 1.2, 0.8],
              opacity: [1, 1, 0],
              rotate: (i % 2 ? 1 : -1) * 200,
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        );
      })}
    </div>
  );
}

export function HomeworkList({ items, compact = false }: { items: HomeworkItem[]; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((i) => [i.id, i.done])));
  const [bursts, setBursts] = useState<BurstState[]>([]);
  const [, startTransition] = useTransition();

  const toggle = (item: HomeworkItem, target: HTMLElement) => {
    const next = !done[item.id];
    setDone((d) => ({ ...d, [item.id]: next }));
    if (next && !reduce) {
      const rect = target.getBoundingClientRect();
      setBursts((b) => [...b, { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);
    }
    startTransition(async () => {
      const result = await toggleHomework({ sessionId: item.id, done: next });
      if (!result.ok) {
        setDone((d) => ({ ...d, [item.id]: !next }));
        toast.error(result.error);
        return;
      }
      if (next) toast.success("Homework done — brilliant work! 🎉");
    });
  };

  const todo = items.filter((i) => !done[i.id]);
  const finished = items.filter((i) => done[i.id]);

  const renderItem = (item: HomeworkItem) => {
    const isDone = !!done[item.id];
    return (
      <motion.li
        key={item.id}
        layout={!reduce}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          onClick={(e) => toggle(item, e.currentTarget.querySelector<HTMLElement>("[data-tick]") ?? e.currentTarget)}
          className={cn(
            "group flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-4 text-left outline-none transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 focus-visible:ring-4 focus-visible:ring-ring/40 active:scale-[0.99]",
            isDone ? "border-leaf/40 bg-leaf/5" : "border-transparent ring-1 ring-foreground/10",
          )}
        >
          <span
            data-tick
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-2xl border-2 transition",
              isDone ? "border-leaf bg-leaf text-white" : "border-muted-foreground/30 group-hover:border-leaf",
            )}
          >
            <AnimatePresence>
              {isDone && (
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                  <CheckIcon className="size-6" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-base font-semibold sm:text-lg", isDone && "text-muted-foreground line-through decoration-leaf decoration-2")}>{item.task}</span>
            <span className="block text-sm text-muted-foreground">
              {item.subject} · from {item.tutor} · {item.setOn}
            </span>
          </span>
        </button>
      </motion.li>
    );
  };

  if (compact) {
    const preview = todo.slice(0, 3);
    return (
      <>
        {preview.length ? (
          <LayoutGroup>
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>{preview.map(renderItem)}</AnimatePresence>
            </ul>
          </LayoutGroup>
        ) : (
          <p className="flex items-center gap-2 rounded-3xl bg-leaf/10 p-4 font-medium">
            <PartyPopperIcon className="size-5 text-leaf" aria-hidden /> All done — nothing left to do!
          </p>
        )}
        {bursts.map((b) => (
          <Burst key={b.id} burst={b} onDone={() => setBursts((all) => all.filter((x) => x.id !== b.id))} />
        ))}
      </>
    );
  }

  return (
    <LayoutGroup>
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="todo-title" className="space-y-3">
          <h2 id="todo-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
            To do <span className="rounded-full bg-coral px-2.5 py-0.5 text-base text-white tabular-nums">{todo.length}</span>
          </h2>
          <ul className="space-y-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {todo.map(renderItem)}
            </AnimatePresence>
          </ul>
          {!todo.length && (
            <p className="flex items-center gap-2 rounded-3xl bg-leaf/10 p-5 text-lg font-semibold">
              <PartyPopperIcon className="size-6 text-leaf" aria-hidden /> You&apos;ve finished everything. Amazing!
            </p>
          )}
        </section>
        <section aria-labelledby="done-title" className="space-y-3">
          <h2 id="done-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
            Done <span className="rounded-full bg-leaf px-2.5 py-0.5 text-base text-white tabular-nums">{finished.length}</span>
          </h2>
          <ul className="space-y-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {finished.map(renderItem)}
            </AnimatePresence>
          </ul>
          {!finished.length && <p className="rounded-3xl border-2 border-dashed p-5 text-muted-foreground">Tick off a task and it&apos;ll land here.</p>}
        </section>
      </div>
      {bursts.map((b) => (
        <Burst key={b.id} burst={b} onDone={() => setBursts((all) => all.filter((x) => x.id !== b.id))} />
      ))}
    </LayoutGroup>
  );
}
