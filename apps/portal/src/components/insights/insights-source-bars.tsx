import { cn } from "@hezaerd/ui/lib/utils";

import { formatCount } from "./insights-labels";

export type InsightsSourceRow = {
  label: string;
  value: number;
  share: string;
  percent: number;
};

type InsightsSourceBarsProps = {
  rows: InsightsSourceRow[];
  emptyMessage?: string;
};

export function InsightsSourceBars({
  rows,
  emptyMessage = "Aucune source enregistrée.",
}: InsightsSourceBarsProps) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{row.label}</span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {row.share}
              <span className="text-muted-foreground/70 mx-1.5">·</span>
              {formatCount(row.value)}
            </span>
          </div>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "bg-chart-1 h-full rounded-full",
                "transition-[width] duration-300 ease-out motion-reduce:transition-none",
              )}
              style={{ width: `${Math.max(row.percent, row.value > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
