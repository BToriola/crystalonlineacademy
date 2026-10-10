"use client";

import { motion, useReducedMotion } from "motion/react";

const colours = ["bg-coral", "bg-sun", "bg-primary", "bg-leaf", "bg-blush", "bg-sky"];
const PIECES = 32;

// Deterministic "random" spread so renders stay pure.
const pieces = Array.from({ length: PIECES }, (_, i) => {
  const angle = (i / PIECES) * Math.PI * 2 + (i % 3) * 0.21;
  const distance = 110 + ((i * 37) % 120);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 40,
    rotate: ((i * 67) % 360) - 180,
    size: 6 + ((i * 13) % 8),
    round: i % 4 === 0,
    colour: colours[i % colours.length],
    delay: (i % 5) * 0.03,
  };
});

export function ConfettiBurst() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute top-16 left-1/2 size-0">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute block ${p.colour} ${p.round ? "rounded-full" : "rounded-xs"}`}
          style={{ width: p.size, height: p.round ? p.size : p.size * 1.8 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{
            x: [0, p.x, p.x * 1.15],
            y: [0, p.y, p.y + 160],
            opacity: [1, 1, 0],
            rotate: [0, p.rotate, p.rotate * 3],
            scale: [0.4, 1, 1],
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
}
