import { Sparkle } from "@/components/brand/doodles";
import { Marquee } from "@/components/motion/marquee";
import { highlights } from "@/config/content";
import { cn } from "@/lib/utils";

const tones = [
  "bg-sky/35",
  "bg-sun/40",
  "bg-blush/40",
  "bg-leaf/15",
  "bg-coral/15",
  "bg-primary/12",
];

function Row({ items, offset = 0, reverse }: { items: readonly string[]; offset?: number; reverse?: boolean }) {
  return (
    <Marquee reverse={reverse} duration={45} className="py-1 [--marquee-gap:0.75rem]">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-foreground sm:px-6 sm:py-3 sm:text-base",
            tones[(i + offset) % tones.length],
          )}
        >
          <Sparkle className="size-3.5 text-current opacity-60" />
          {item}
        </span>
      ))}
    </Marquee>
  );
}

export function HighlightsMarquee() {
  const half = Math.ceil(highlights.length / 2);
  const first = [...highlights.slice(0, half), ...highlights.slice(0, half)];
  const second = [...highlights.slice(half), ...highlights.slice(half)];

  return (
    <section aria-label="Highlights" className="overflow-hidden py-10 sm:py-14">
      <ul className="sr-only">
        {highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <div aria-hidden className="space-y-3">
        <Row items={first} />
        <Row items={second} offset={3} reverse />
      </div>
    </section>
  );
}
