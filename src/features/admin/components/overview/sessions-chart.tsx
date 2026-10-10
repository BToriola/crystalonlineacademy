"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WeeklySessionsPoint } from "@/features/admin/lib/overview";

const config = {
  completed: { label: "Completed", color: "var(--chart-3)" },
  scheduled: { label: "Scheduled", color: "var(--chart-1)" },
  missed: { label: "Missed / cancelled", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function SessionsChart({ data }: { data: WeeklySessionsPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full" aria-label="Sessions per week, stacked by status">
      <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip cursor={{ radius: 8 }} content={<ChartTooltipContent labelFormatter={(label) => `Week of ${label}`} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="completed" stackId="s" fill="var(--color-completed)" radius={[0, 0, 6, 6]} maxBarSize={44} />
        <Bar dataKey="scheduled" stackId="s" fill="var(--color-scheduled)" maxBarSize={44} />
        <Bar dataKey="missed" stackId="s" fill="var(--color-missed)" radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ChartContainer>
  );
}
