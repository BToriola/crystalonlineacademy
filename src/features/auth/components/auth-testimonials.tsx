"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { testimonials } from "@/config/content";
import { cn } from "@/lib/utils";

export function AuthTestimonials() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6500);
    return () => window.clearInterval(id);
  }, [reduce]);

  const t = testimonials[index];

  return (
    <div>
      <div className="relative min-h-52" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="font-display text-2xl leading-snug font-semibold text-balance xl:text-3xl">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 text-sm text-white/75">
              <span className="font-semibold text-white">{t.name}</span> · {t.detail}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-2">
        {testimonials.map((item, i) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
              i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
