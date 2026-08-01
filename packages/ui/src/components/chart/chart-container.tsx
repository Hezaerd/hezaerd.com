import { cn } from "@hezaerd/ui/lib/utils";
import * as React from "react";

import { ChartProvider, ChartStyle, type ChartConfig } from "./chart-config";

type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactNode;
};

export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartProvider config={config}>
      <ChartStyle id={chartId} config={config} />
      <div
        data-chart={chartId}
        className={cn(
          "text-muted-foreground flex w-full justify-center text-xs [&_svg]:overflow-visible",
          "[&_.ts-chart-axis-tick]:fill-muted-foreground [&_.ts-chart-grid-line]:stroke-border/50",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ChartProvider>
  );
}
