import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: number;
};

export function Marquee({ children, className, reverse, duration = 40 }: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--marquee-gap:1.5rem] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex w-max shrink-0 animate-marquee gap-(--marquee-gap) group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {children}
        <div aria-hidden className="contents">
          {children}
        </div>
      </div>
    </div>
  );
}
