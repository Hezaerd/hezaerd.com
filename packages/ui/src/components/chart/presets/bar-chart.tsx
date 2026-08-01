import { barX, defineChart } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/react-charts";
import { scaleBand, scaleLinear } from "d3-scale";
import { useMemo } from "react";

import { ChartContainer } from "../chart-container";
import { getChartColor, type ChartConfig } from "../chart-config";

export type BarChartRow = {
  label: string;
  value: number;
};

const defaultConfig = {
  value: {
    label: "Vues",
    color: "var(--color-value)",
  },
} satisfies ChartConfig;

type InsightsBarChartProps = {
  data: BarChartRow[];
  config?: ChartConfig;
  className?: string;
  height?: number;
  ariaLabel?: string;
};

export function InsightsBarChart({
  data,
  config = defaultConfig,
  className,
  height,
  ariaLabel = "Répartition des sources",
}: InsightsBarChartProps) {
  const accent = getChartColor(config, "value", "var(--chart-1)");
  const resolvedHeight = height ?? Math.max(160, data.length * 36 + 48);

  const definition = useMemo(() => {
    return defineChart({
      marks: [
        barX(data, {
          x: "value",
          y: "label",
          fill: accent,
          radius: 4,
        }),
      ],
      x: {
        scale: scaleLinear,
        nice: true,
        grid: true,
        axis: {
          ticks: {
            format: (value) => Math.round(value as number).toLocaleString("fr-CA"),
          },
        },
      },
      y: {
        scale: () => scaleBand().padding(0.28),
        axis: {
          ticks: {
            format: (value) => String(value),
          },
        },
      },
      tooltip,
    });
  }, [accent, data]);

  return (
    <ChartContainer config={config} className={className}>
      <Chart definition={definition} height={resolvedHeight} ariaLabel={ariaLabel} />
    </ChartContainer>
  );
}
