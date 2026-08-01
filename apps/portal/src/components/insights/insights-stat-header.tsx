import type { InsightsPeriod } from "@/lib/convex-queries";

import { formatCount, periodStatSuffix } from "./insights-labels";

type InsightsStatHeaderProps = {
  period: InsightsPeriod;
  totalVisitors: number;
  visitorsToday: number;
};

export function InsightsStatHeader({
  period,
  totalVisitors,
  visitorsToday,
}: InsightsStatHeaderProps) {
  const periodLabel = periodStatSuffix[period];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
          {formatCount(totalVisitors)}
        </p>
        <p className="text-muted-foreground text-sm">{periodLabel}</p>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {period !== "today" ? (
          <>
            {formatCount(visitorsToday)} aujourd&apos;hui
            <span aria-hidden="true"> · </span>
          </>
        ) : null}
        Visiteurs (estimation)
      </p>
    </div>
  );
}
