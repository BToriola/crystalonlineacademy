"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Hand-drawn "A+" that circles itself in, then gently rocks. */
export function HeroDoodle({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 120 120"
      aria-hidden
      className={cn("text-leaf dark:text-sun", className)}
      initial={{ rotate: reduce ? -8 : -30, scale: reduce ? 1 : 0.6, opacity: 0 }}
      animate={reduce ? { rotate: -8, scale: 1, opacity: 1 } : { rotate: [-30, -4, -12, -8], scale: 1, opacity: 1 }}
      transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.path
        d="M60 8c30 0 52 22 52 52s-24 52-54 52S7 88 8 58 32 6 64 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.9, ease: "easeInOut" }}
      />
      <motion.text
        x="60"
        y="80"
        textAnchor="middle"
        className="fill-current font-script"
        fontSize="60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 1.6 }}
      >
        A+
      </motion.text>
    </motion.svg>
  );
}
