import { cn } from "@/lib/utils";

export function Script({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-script font-normal tracking-normal text-coral", className)}>{children}</span>;
}

export function CircledGrade({ grade = "A", className }: { grade?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn("size-24 text-leaf", className)} aria-hidden>
      <path
        d="M60 8c30 0 52 22 52 52s-24 52-54 52S7 88 8 58 32 6 64 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <text x="60" y="80" textAnchor="middle" className="fill-current font-script" fontSize="64">
        {grade}
      </text>
    </svg>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" className={cn("h-3 w-full text-coral", className)} aria-hidden>
      <path d="M2 12C30 2 50 18 80 10s50-8 70 0 34 6 48-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6 text-sun", className)} aria-hidden>
      <path d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function Blob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn("size-40", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M43.5-57.9C55.6-49.5 63.6-35.1 68.4-19.5 73.2-3.9 74.8 12.9 68.6 26.2 62.4 39.5 48.4 49.3 33.4 57.3 18.4 65.3 2.4 71.5-14.6 70.4-31.6 69.3-49.6 60.9-60.6 47.1-71.6 33.3-75.6 14.1-72.6-3.5-69.6-21.1-59.6-37.1-46.4-45.4-33.2-53.7-16.6-54.3-.4-53.8 15.8-53.3 31.4-66.3 43.5-57.9Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
