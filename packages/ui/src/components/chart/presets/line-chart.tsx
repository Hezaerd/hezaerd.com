import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@hezaerd/ui/components/chart";
import { cn } from "@hezaerd/ui/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type LineChartPoint = {
  dayKey: string;
  visitors: number;
};

const defaultConfig = {
  visitors: {
    label: "Visiteurs",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type InsightsLineChartProps = {
  data: LineChartPoint[];
  config?: ChartConfig;
  className?: string;
  height?: number;
  ariaLabel?: string;
};

function formatDayKey(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat("fr-CA", { month: "short", day: "numeric" }).format(date);
}

function formatVisitors(value: number) {
  return Math.round(value).toLocaleString("fr-CA");
}

export function InsightsLineChart({
  data,
  config = defaultConfig,
  className,
  height = 240,
  ariaLabel = "Visiteurs par jour",
}: InsightsLineChartProps) {
  const chartData = data.map((point) => ({
    dayKey: point.dayKey,
    label: formatDayKey(point.dayKey),
    visitors: point.visitors,
  }));

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto w-full", className)}
      style={{ height }}
      aria-label={ariaLabel}
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={40}
          tickFormatter={formatVisitors}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value) => formatVisitors(Number(value))}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="visitors"
          fill="var(--color-visitors)"
          fillOpacity={0.16}
          stroke="var(--color-visitors)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
