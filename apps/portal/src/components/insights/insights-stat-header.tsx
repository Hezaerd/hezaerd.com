import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@hezaerd/ui/components/tooltip";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsPeriod } from "@/lib/convex-queries";

import {
  formatCount,
  formatVisitorDelta,
  periodComparisonSuffix,
  periodStatSuffix,
} from "./insights-labels";

type InsightsStatHeaderProps = {
  period: InsightsPeriod;
  totalVisitors: number;
  visitorsToday: number;
  deltaPercent: number | null;
};

export function InsightsStatHeader({
  period,
  totalVisitors,
  visitorsToday,
  deltaPercent,
}: InsightsStatHeaderProps) {
  const periodLabel = periodStatSuffix[period];
  const comparisonLabel = periodComparisonSuffix[period];
  const deltaLabel = formatVisitorDelta(deltaPercent);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
          {formatCount(totalVisitors)}
        </p>
        <p className="text-muted-foreground text-sm">{periodLabel}</p>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed">
        <span>{formatCount(visitorsToday)} aujourd&apos;hui</span>
        <span aria-hidden="true">·</span>

        {deltaLabel ? (
          <>
            <span
              className={cn(
                "font-medium tabular-nums",
                deltaLabel === "stable"
                  ? "text-muted-foreground"
                  : deltaPercent !== null && deltaPercent > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400",
              )}
            >
              {deltaLabel === "stable" ? "Stable" : deltaLabel} {comparisonLabel}
            </span>
            <span aria-hidden="true">·</span>
          </>
        ) : null}

        <span className="inline-flex items-center gap-1">
          Visiteurs (estimation)
          <Tooltip>
            <TooltipTrigger
              className="text-muted-foreground/70 hover:text-muted-foreground inline-flex rounded-sm"
              aria-label="Comment sont comptés les visiteurs"
            >
              <HugeiconsIcon icon={InformationCircleIcon} size={14} />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Somme journalière — une même personne peut compter plusieurs jours sur une longue
              période.
            </TooltipContent>
          </Tooltip>
        </span>
      </div>
    </div>
  );
}
