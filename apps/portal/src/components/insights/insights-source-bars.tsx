import { cn } from "@hezaerd/ui/lib/utils";

import { SourceIcon } from "./insights-favicon";
import { formatCount } from "./insights-labels";

export type InsightsSourceRow = {
  sourceKind: string;
  label: string;
  value: number;
  share: string;
  percent: number;
  barClassName: string;
};

type InsightsSourceBarsProps = {
  rows: InsightsSourceRow[];
  emptyMessage?: string;
  animateBars?: boolean;
};

export function InsightsSourceBars({
  rows,
  emptyMessage = "Aucune source enregistrée.",
  animateBars = false,
}: InsightsSourceBarsProps) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.sourceKind} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex min-w-0 items-center gap-2.5">
              <SourceIcon sourceKind={row.sourceKind} size={18} />
              <span className="truncate text-sm font-medium">{row.label}</span>
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {row.share}
              <span className="text-muted-foreground/70 mx-1.5">·</span>
              {formatCount(row.value)}
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className={cn(
                row.barClassName,
                "h-full rounded-full",
                animateBars &&
                  "transition-[width] duration-200 ease-out motion-reduce:transition-none",
              )}
              style={{ width: `${Math.max(row.percent, row.value > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
