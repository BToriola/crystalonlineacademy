"use client";

import { motion, useReducedMotion } from "motion/react";

export function RotateIn({ children, className, rotate = -4 }: { children: React.ReactNode; className?: string; rotate?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 80, rotate, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
