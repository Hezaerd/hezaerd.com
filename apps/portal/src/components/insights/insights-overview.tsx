import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsPeriod } from "@/lib/convex-queries";

import { InsightsDataTable } from "./insights-data-table";
import { InsightsLineChart } from "./insights-line-chart";
import { formatCount, formatShare, sourceKindLabels } from "./insights-labels";
import { InsightsPagesPanel } from "./insights-pages-panel";
import { InsightsPathLabel, InsightsRouteLabel } from "./insights-path-label";
import { InsightsPeriodPicker } from "./insights-period-picker";
import { InsightsSourceBars } from "./insights-source-bars";
import { InsightsSourceDetails } from "./insights-source-details";
import { sourceKindBarClass } from "./insights-source-visuals";
import { InsightsStatHeader } from "./insights-stat-header";
import type { InsightsOverviewData, InsightsShellVariant } from "./insights-types";

type InsightsOverviewProps = {
  data: InsightsOverviewData;
  period: InsightsPeriod;
  onPeriodChange: (period: InsightsPeriod) => void;
  variant?: InsightsShellVariant;
  showEvents?: boolean;
  headerAction?: React.ReactNode;
};

type InsightsOverviewPanelsProps = {
  data: InsightsOverviewData;
  period: InsightsPeriod;
  onPeriodChange?: (period: InsightsPeriod) => void;
  variant?: InsightsShellVariant;
  showEvents?: boolean;
  isRefreshing?: boolean;
};

function SectionBlock({
  title,
  children,
  className,
  stretch,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  stretch?: boolean;
}) {
  return (
    <section className={cn("flex flex-col gap-3", stretch && "h-full", className)}>
      <h2 className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Panel({ children, className, fill }: { children: React.ReactNode; className?: string; fill?: boolean }) {
  return (
    <div
      className={cn(
        "border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-4",
        fill && "min-h-0 flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InsightsOverviewPanels({
  data,
  period,
  onPeriodChange,
  variant = "desk",
  showEvents = true,
  isRefreshing = false,
}: InsightsOverviewPanelsProps) {
  const sourceTotal = data.sources.reduce((sum, source) => sum + source.views, 0);
  const sourceRows = data.sources.map((source) => {
    const percent = sourceTotal > 0 ? (source.views / sourceTotal) * 100 : 0;
    return {
      sourceKind: source.sourceKind,
      label: sourceKindLabels[source.sourceKind] ?? source.sourceKind,
      value: source.views,
      share: formatShare(source.views, sourceTotal),
      percent,
      barClassName: sourceKindBarClass(source.sourceKind),
    };
  });

  const siteHost = data.siteHost;

  return (
    <div className={cn("flex flex-col gap-6", variant === "workspace" && "gap-8")}>
      <SectionBlock title="Visiteurs">
        <div
          className={cn(
            "flex flex-col gap-4",
            "transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none",
            isRefreshing && "opacity-80 blur-[1px] motion-reduce:blur-none",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <InsightsStatHeader
              period={period}
              totalVisitors={data.traffic.totals.visitors}
              visitorsToday={data.traffic.visitorsToday}
              deltaPercent={data.traffic.comparison.deltaPercent}
            />
            {onPeriodChange ? (
              <InsightsPeriodPicker value={period} onValueChange={onPeriodChange} />
            ) : null}
          </div>
          <Panel className="overflow-hidden p-2">
            <InsightsLineChart
              data={data.traffic.series.map((point) => ({
                dayKey: point.dayKey,
                visitors: point.visitors,
              }))}
            />
          </Panel>
        </div>
      </SectionBlock>

      <div
        className={cn(
          "grid gap-6",
          variant === "desk" && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch",
          variant === "workspace" && "gap-8",
        )}
      >
        <SectionBlock title="Sources" stretch={variant === "desk"}>
          <Panel fill={variant === "desk"}>
            <InsightsSourceBars rows={sourceRows} animateBars={isRefreshing} />
            <InsightsSourceDetails rows={data.sourceDetails} totalViews={sourceTotal} />
          </Panel>
        </SectionBlock>

        <SectionBlock title="Pages" stretch={variant === "desk"}>
          <Panel fill={variant === "desk"}>
            <InsightsPagesPanel data={data} variant={variant} siteHost={siteHost} />
          </Panel>
        </SectionBlock>
      </div>

      <SectionBlock title="Parcours">
        <Panel>
          <InsightsDataTable
            variant={variant}
            showRank
            rows={data.routes}
            rowKey={(row) => row.routeKey}
            columns={[
              {
                key: "routeKey",
                header: "Parcours",
                format: (row) => <InsightsRouteLabel routeKey={row.routeKey} siteHost={siteHost} />,
              },
              {
                key: "views",
                header: "Vues",
                align: "right",
                format: (row) => formatCount(row.views),
              },
            ]}
            emptyMessage="Aucun parcours enregistré."
          />
        </Panel>
      </SectionBlock>

      {showEvents && data.events ? (
        <SectionBlock title="Actions">
          <Panel>
            <InsightsDataTable
              variant={variant}
              rows={[
                ...data.events.items.map((event) => ({
                  label: event.eventName,
                  count: event.count,
                })),
                ...(data.events.otherCount > 0
                  ? [{ label: "Autres", count: data.events.otherCount }]
                  : []),
              ]}
              rowKey={(row) => row.label}
              columns={[
                { key: "label", header: "Action" },
                {
                  key: "count",
                  header: "Total",
                  align: "right",
                  format: (row) => formatCount(row.count),
                },
              ]}
              emptyMessage="Aucune action enregistrée."
            />
          </Panel>
        </SectionBlock>
      ) : null}
    </div>
  );
}

export function InsightsOverview({
  data,
  period,
  onPeriodChange,
  variant = "desk",
  showEvents = true,
  headerAction,
}: InsightsOverviewProps) {
  return (
    <div className={cn("flex flex-col gap-6", variant === "workspace" && "gap-8")}>
      {headerAction ? (
        <div className="flex justify-end">{headerAction}</div>
      ) : null}
      <InsightsOverviewPanels
        data={data}
        period={period}
        onPeriodChange={onPeriodChange}
        variant={variant}
        showEvents={showEvents}
      />
    </div>
  );
}
