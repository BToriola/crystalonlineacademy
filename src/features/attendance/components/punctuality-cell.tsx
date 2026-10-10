import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Punctuality } from "../punctuality";

export function PunctualityCell({ stats }: { stats?: Punctuality }) {
  if (!stats?.total) return <span className="text-sm text-muted-foreground">—</span>;
  const pct = Math.round((stats.onTime / stats.total) * 100);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex cursor-default rounded-full px-2.5 py-1 text-xs font-semibold",
            pct >= 95 ? "bg-success/12 text-success" : pct >= 80 ? "bg-warning/15 text-warning" : "bg-destructive/10 text-destructive",
          )}
        >
          {pct}%
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {stats.onTime} on time · {stats.late} late · {stats.noShow} not joined, out of {stats.total} classes
      </TooltipContent>
    </Tooltip>
  );
}
