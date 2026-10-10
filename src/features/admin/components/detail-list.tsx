import { cn } from "@/lib/utils";

export function DetailList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-4 gap-y-3 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-0.5">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="text-sm break-words">{item.value ?? <span className="text-muted-foreground">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SubjectChips({ subjects, max, className }: { subjects: string[]; max?: number; className?: string }) {
  const shown = max ? subjects.slice(0, max) : subjects;
  const extra = subjects.length - shown.length;
  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {shown.map((s) => (
        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {s}
        </span>
      ))}
      {extra > 0 && <span className="rounded-full px-1.5 py-0.5 text-xs text-muted-foreground">+{extra}</span>}
    </span>
  );
}
