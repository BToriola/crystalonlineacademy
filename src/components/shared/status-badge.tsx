import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-sun/25 text-ink dark:text-sun",
  trial_booked: "bg-blush/40 text-ink dark:text-blush",
  converted: "bg-success/12 text-success",
  closed: "bg-muted text-muted-foreground",
  screening: "bg-sun/25 text-ink dark:text-sun",
  interview: "bg-blush/40 text-ink dark:text-blush",
  demo: "bg-primary/10 text-primary",
  approved: "bg-success/12 text-success",
  rejected: "bg-destructive/10 text-destructive",
  active: "bg-success/12 text-success",
  paused: "bg-sun/25 text-ink dark:text-sun",
  ended: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  completed: "bg-success/12 text-success",
  cancelled: "bg-muted text-muted-foreground",
  missed: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/12 text-success",
  overdue: "bg-destructive/10 text-destructive",
  mastered: "bg-success/12 text-success",
  improving: "bg-primary/10 text-primary",
  needs_support: "bg-coral/12 text-coral",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("rounded-full border-0 font-medium capitalize", styles[status], className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
