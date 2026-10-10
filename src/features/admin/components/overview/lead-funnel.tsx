import type { leadFunnel } from "@/features/admin/lib/overview";
import { cn } from "@/lib/utils";

const barTones = ["bg-primary/80", "bg-sky", "bg-blush", "bg-leaf"];

export function LeadFunnel({ funnel }: { funnel: ReturnType<typeof leadFunnel> }) {
  const max = Math.max(1, ...funnel.stages.map((s) => s.count));
  const converted = funnel.stages.at(-1)?.count ?? 0;
  const top = funnel.stages[0]?.count ?? 0;
  const rate = top ? Math.round((converted / top) * 100) : 0;

  return (
    <div className="space-y-5">
      <ol className="space-y-3">
        {funnel.stages.map((stage, i) => (
          <li key={stage.status} className="space-y-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{stage.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {stage.count}
                {stage.current !== stage.count && <span className="sr-only">, {stage.current} currently at this stage</span>}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn("h-full rounded-full transition-[width] duration-700", barTones[i])}
                style={{ width: `${Math.max(4, (stage.count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Enquiry → enrolled</span>
        <span className="font-display text-lg font-bold">{rate}%</span>
      </div>
      {funnel.closed > 0 && (
        <p className="text-xs text-muted-foreground">
          {funnel.closed} {funnel.closed === 1 ? "request was" : "requests were"} closed without enrolling.
        </p>
      )}
    </div>
  );
}
