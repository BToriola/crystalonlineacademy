"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type HTMLMotionProps } from "motion/react";

export function Parallax({ offset = 60, children, ...props }: HTMLMotionProps<"div"> & { offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} {...props}>
      {children}
    </motion.div>
  );
}
