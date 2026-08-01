import { Skeleton } from "@hezaerd/ui/components/skeleton";
import { useEffect, useState } from "react";

type InsightsLineChartProps = {
  data: Array<{ dayKey: string; visitors: number }>;
};

type LineChartComponent = (props: InsightsLineChartProps) => React.JSX.Element;

export function InsightsLineChart(props: InsightsLineChartProps) {
  const [Chart, setChart] = useState<LineChartComponent | null>(null);

  useEffect(() => {
    void import("@hezaerd/ui/components/chart/presets/line-chart").then((module) => {
      setChart(() => module.InsightsLineChart);
    });
  }, []);

  if (!Chart) {
    return <Skeleton className="aspect-auto h-[240px] w-full rounded-lg" aria-hidden />;
  }

  return <Chart {...props} />;
}
