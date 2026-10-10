import Link from "next/link";
import { ChevronRightIcon, PartyPopperIcon } from "lucide-react";
import type { AttentionItem } from "@/features/admin/lib/overview";
import { cn } from "@/lib/utils";

const tones: Record<AttentionItem["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  coral: "bg-coral/12 text-coral",
  sun: "bg-sun/25 text-ink dark:text-sun",
  destructive: "bg-destructive/10 text-destructive",
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-2xl bg-leaf/12 text-leaf">
          <PartyPopperIcon className="size-5" />
        </span>
        <p className="font-medium">All clear</p>
        <p className="text-sm text-muted-foreground">Nothing needs you right now. Enjoy a cuppa.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            href={item.href}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl font-display text-sm font-bold tabular-nums", tones[item.tone])}>
              {item.count}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
            </span>
            <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
