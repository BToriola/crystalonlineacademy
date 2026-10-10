import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <path d="M20 3 35 14 20 37 5 14Z" className={inverted ? "fill-white" : "fill-primary"} />
      <path d="M5 14h30L20 37Z" className={inverted ? "fill-white/75" : "fill-primary"} style={inverted ? undefined : { filter: "brightness(0.8)" }} />
      <path d="M13 14 20 3l7 11-7 23Z" className={inverted ? "fill-primary/15" : "fill-white/25"} />
      <circle cx="33" cy="33" r="4.5" className="fill-coral" />
    </svg>
  );
}

export function Logo({ className, inverted, href = "/" }: { className?: string; inverted?: boolean; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2", className)} aria-label="Crystal Online Academy home">
      <LogoMark inverted={inverted} className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.45rem] font-extrabold tracking-tight", inverted ? "text-white" : "text-primary")}>
          crystal<span className="text-coral">.</span>
        </span>
        <span className={cn("text-[0.62rem] font-semibold tracking-[0.2em] uppercase", inverted ? "text-white/70" : "text-muted-foreground")}>
          online academy
        </span>
      </span>
    </Link>
  );
}
