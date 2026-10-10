"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatMoney } from "@/lib/format";

export type EarningsPoint = { month: string; label: string; earnings: number; sessions: number };

const config = {
  earnings: { label: "Earnings", color: "var(--color-primary)" },
} satisfies ChartConfig;

export function EarningsChart({ data }: { data: EarningsPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatMoney(v)} />
        <ChartTooltip
          cursor={{ radius: 6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as EarningsPoint | undefined;
                return p ? `${p.label} · ${p.sessions} session${p.sessions === 1 ? "" : "s"}` : "";
              }}
              formatter={(value) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">Earnings</span>
                  <span className="font-mono font-medium tabular-nums">{formatMoney(Number(value))}</span>
                </span>
              )}
            />
          }
        />
        <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ChartContainer>
  );
}
