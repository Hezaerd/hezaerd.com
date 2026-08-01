import { areaY, defineChart, lineY } from "@tanstack/charts";
import { tooltip } from "@tanstack/charts/tooltip";
import { Chart } from "@tanstack/react-charts";
import { scaleLinear, scaleUtc } from "d3-scale";
import { useMemo } from "react";

import { ChartContainer } from "../chart-container";
import { getChartColor, type ChartConfig } from "../chart-config";

export type LineChartPoint = {
  dayKey: string;
  visitors: number;
};

const defaultConfig = {
  visitors: {
    label: "Visiteurs",
    color: "var(--color-visitors)",
  },
} satisfies ChartConfig;

type InsightsLineChartProps = {
  data: LineChartPoint[];
  config?: ChartConfig;
  className?: string;
  height?: number;
  ariaLabel?: string;
};

function parseDayKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`);
}

export function InsightsLineChart({
  data,
  config = defaultConfig,
  className,
  height = 240,
  ariaLabel = "Visiteurs par jour",
}: InsightsLineChartProps) {
  const accent = getChartColor(config, "visitors", "var(--chart-1)");

  const definition = useMemo(() => {
    const rows = data.map((point) => ({
      date: parseDayKey(point.dayKey),
      visitors: point.visitors,
    }));

    return defineChart({
      marks: [
        areaY(rows, {
          x: "date",
          y: "visitors",
          fill: accent,
          fillOpacity: 0.16,
        }),
        lineY(rows, {
          x: "date",
          y: "visitors",
          stroke: accent,
          strokeWidth: 2,
        }),
      ],
      x: {
        scale: scaleUtc,
        axis: {
          ticks: {
            format: (value) =>
              new Intl.DateTimeFormat("fr-CA", { month: "short", day: "numeric" }).format(
                value as Date,
              ),
          },
        },
      },
      y: {
        scale: scaleLinear,
        nice: true,
        grid: true,
        axis: {
          ticks: {
            format: (value) => Math.round(value as number).toLocaleString("fr-CA"),
          },
        },
      },
      tooltip,
    });
  }, [accent, data]);

  return (
    <ChartContainer config={config} className={className}>
      <Chart definition={definition} height={height} ariaLabel={ariaLabel} />
    </ChartContainer>
  );
}
