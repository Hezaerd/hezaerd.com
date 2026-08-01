import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@hezaerd/ui/components/chart";
import { cn } from "@hezaerd/ui/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type BarChartRow = {
  label: string;
  value: number;
};

const defaultConfig = {
  value: {
    label: "Vues",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type InsightsBarChartProps = {
  data: BarChartRow[];
  config?: ChartConfig;
  className?: string;
  height?: number;
  ariaLabel?: string;
};

function formatValue(value: number) {
  return Math.round(value).toLocaleString("fr-CA");
}

export function InsightsBarChart({
  data,
  config = defaultConfig,
  className,
  height,
  ariaLabel = "Répartition des sources",
}: InsightsBarChartProps) {
  const resolvedHeight = height ?? Math.max(160, data.length * 36 + 48);

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto w-full", className)}
      style={{ height: resolvedHeight }}
      aria-label={ariaLabel}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={formatValue} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={96}
          tickMargin={8}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="label"
              formatter={(value) => formatValue(Number(value))}
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
