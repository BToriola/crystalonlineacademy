"use client";

import { motion, useReducedMotion } from "motion/react";
import { LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tileColours = ["bg-sun/35", "bg-blush/45", "bg-sky/45", "bg-leaf/20", "bg-coral/15"];

export function BadgeTile({
  emoji,
  title,
  description,
  earnedLabel,
  index,
}: {
  emoji: string;
  title: string;
  description: string;
  earnedLabel: string | null;
  index: number;
}) {
  const reduce = useReducedMotion();
  const earned = Boolean(earnedLabel);
  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.06 }}
      whileHover={earned && !reduce ? { rotate: [0, -4, 4, -2, 0], scale: 1.04 } : undefined}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-3xl p-5 text-center",
        earned ? cn(tileColours[index % tileColours.length], "shadow-sm") : "border-2 border-dashed bg-muted/40",
      )}
    >
      {!earned && (
        <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-background text-muted-foreground">
          <LockIcon className="size-3.5" aria-hidden />
        </span>
      )}
      <span aria-hidden className={cn("text-5xl sm:text-6xl", !earned && "opacity-40 grayscale")}>
        {emoji}
      </span>
      <h3 className={cn("font-display text-lg leading-tight font-extrabold", !earned && "text-muted-foreground")}>{title}</h3>
      <p className="text-sm text-muted-foreground">{earned ? description : `How to unlock: ${description.charAt(0).toLowerCase()}${description.slice(1)}`}</p>
      {earned ? (
        <span className="mt-auto rounded-full bg-card px-3 py-1 text-xs font-semibold">Earned {earnedLabel}</span>
      ) : (
        <span className="mt-auto rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Locked</span>
      )}
    </motion.li>
  );
}
