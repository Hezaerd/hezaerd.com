import { Separator } from "@hezaerd/ui/components/separator";
import { InsightsLineChart } from "@hezaerd/ui/components/chart/presets/line-chart";
import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsPeriod } from "@/lib/convex-queries";

import { InsightsDataTable } from "./insights-data-table";
import { formatCount, formatShare, sourceKindLabels } from "./insights-labels";
import { InsightsPeriodPicker } from "./insights-period-picker";
import { InsightsSourceBars } from "./insights-source-bars";
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
  variant?: InsightsShellVariant;
  showEvents?: boolean;
  isRefreshing?: boolean;
};

function SectionBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-muted-foreground text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-4",
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
  variant = "desk",
  showEvents = true,
  isRefreshing = false,
}: InsightsOverviewPanelsProps) {
  const sourceTotal = data.sources.reduce((sum, source) => sum + source.views, 0);
  const sourceRows = data.sources.map((source) => {
    const percent = sourceTotal > 0 ? (source.views / sourceTotal) * 100 : 0;
    return {
      label: sourceKindLabels[source.sourceKind] ?? source.sourceKind,
      value: source.views,
      share: formatShare(source.views, sourceTotal),
      percent,
    };
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        variant === "workspace" && "gap-8",
        "transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none",
        isRefreshing && "opacity-80 blur-[1px] motion-reduce:blur-none",
      )}
    >
      <SectionBlock title="Visiteurs">
        <InsightsStatHeader
          period={period}
          totalVisitors={data.traffic.totals.visitors}
          visitorsToday={data.traffic.visitorsToday}
        />
        <Panel className="overflow-hidden p-2">
          <InsightsLineChart
            data={data.traffic.series.map((point) => ({
              dayKey: point.dayKey,
              visitors: point.visitors,
            }))}
          />
        </Panel>
      </SectionBlock>

      <div
        className={cn(
          "grid gap-6",
          variant === "desk" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : "gap-8",
        )}
      >
        <SectionBlock title="Sources">
          <Panel>
            <InsightsSourceBars rows={sourceRows} />
          </Panel>
        </SectionBlock>

        <SectionBlock title="Pages">
          <Panel className="gap-0 p-0">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Pages vues</h3>
                <InsightsDataTable
                  variant={variant}
                  rows={data.topPages}
                  columns={[
                    { key: "path", header: "Chemin", mono: true },
                    {
                      key: "views",
                      header: "Vues",
                      align: "right",
                      format: (row) => formatCount(row.views),
                    },
                  ]}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Entrées</h3>
                <InsightsDataTable
                  variant={variant}
                  rows={data.landings}
                  columns={[
                    { key: "path", header: "Chemin", mono: true },
                    {
                      key: "entries",
                      header: "Entrées",
                      align: "right",
                      format: (row) => formatCount(row.entries),
                    },
                  ]}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Sorties</h3>
                <InsightsDataTable
                  variant={variant}
                  rows={data.exits}
                  columns={[
                    { key: "path", header: "Chemin", mono: true },
                    {
                      key: "exits",
                      header: "Sorties",
                      align: "right",
                      format: (row) => formatCount(row.exits),
                    },
                  ]}
                />
              </div>
            </div>
          </Panel>
        </SectionBlock>
      </div>

      <SectionBlock title="Parcours">
        <Panel>
          <InsightsDataTable
            variant={variant}
            rows={data.routes}
            columns={[
              { key: "routeKey", header: "Parcours", mono: true },
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InsightsPeriodPicker value={period} onValueChange={onPeriodChange} />
        {headerAction}
      </div>
      <InsightsOverviewPanels
        data={data}
        period={period}
        variant={variant}
        showEvents={showEvents}
      />
    </div>
  );
}
