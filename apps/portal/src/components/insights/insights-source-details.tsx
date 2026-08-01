import { cn } from "@hezaerd/ui/lib/utils";
import { useState } from "react";

import { faviconUrl } from "./insights-favicon";
import { formatCount, formatShare, sourceKindLabels } from "./insights-labels";

export type InsightsSourceDetailRow = {
  sourceKind: string;
  sourceDetail: string;
  views: number;
};

type InsightsSourceDetailsProps = {
  rows: InsightsSourceDetailRow[];
  totalViews: number;
};

function isLikelyDomain(detail: string) {
  return detail.includes(".") && !detail.includes(" ");
}

function formatDetailLabel(detail: string) {
  return detail.replace(/_/g, " ");
}

function DetailIcon({ detail }: { detail: string }) {
  const [failed, setFailed] = useState(false);

  if (!isLikelyDomain(detail) || failed) {
    return (
      <span className="bg-muted/50 text-muted-foreground inline-flex size-4 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold uppercase">
        {detail.slice(0, 1)}
      </span>
    );
  }

  return (
    <span className="bg-muted/40 inline-flex size-4 shrink-0 overflow-hidden rounded-md">
      <img
        src={faviconUrl(detail, 32)}
        alt=""
        width={16}
        height={16}
        className="size-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export function InsightsSourceDetails({ rows, totalViews }: InsightsSourceDetailsProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="border-border flex flex-col gap-2 border-t pt-4">
      <p className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
        Détail
      </p>
      <ul className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <li
            key={`${row.sourceKind}-${row.sourceDetail}`}
            className="flex items-center justify-between gap-3"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <DetailIcon detail={row.sourceDetail} />
              <span className="min-w-0 truncate text-sm">{formatDetailLabel(row.sourceDetail)}</span>
              <span
                className={cn(
                  "text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium tracking-wide uppercase",
                  "bg-muted/60",
                )}
              >
                {sourceKindLabels[row.sourceKind] ?? row.sourceKind}
              </span>
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatShare(row.views, totalViews)}
              <span className="text-muted-foreground/70 mx-1.5">·</span>
              {formatCount(row.views)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
