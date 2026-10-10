import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary/10 text-primary",
  coral: "bg-coral/12 text-coral",
  leaf: "bg-leaf/12 text-leaf",
  sun: "bg-sun/25 text-ink dark:text-sun",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <Card className={cn("gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="font-display text-3xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
