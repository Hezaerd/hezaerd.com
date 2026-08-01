import { ToggleGroup, ToggleGroupItem } from "@hezaerd/ui/components/toggle-group";
import { useState } from "react";

import { InsightsDataTable } from "./insights-data-table";
import { formatCount } from "./insights-labels";
import { InsightsPathLabel } from "./insights-path-label";
import type { InsightsOverviewData, InsightsShellVariant } from "./insights-types";

type PageTab = "views" | "entries" | "exits";

const pageTabLabels: Record<PageTab, string> = {
  views: "Vues",
  entries: "Entrées",
  exits: "Sorties",
};

type InsightsPagesPanelProps = {
  data: InsightsOverviewData;
  variant: InsightsShellVariant;
  siteHost: string;
};

export function InsightsPagesPanel({ data, variant, siteHost }: InsightsPagesPanelProps) {
  const [tab, setTab] = useState<PageTab>("views");

  const metricHeader = pageTabLabels[tab];
  const pathColumn = {
    key: "path" as const,
    header: "Chemin",
    format: (row: { path: string }) => (
      <InsightsPathLabel path={row.path} siteHost={siteHost} />
    ),
  };

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[tab]}
        onValueChange={(next) => {
          const value = next[0] as PageTab | undefined;
          if (value) {
            setTab(value);
          }
        }}
      >
        {(Object.keys(pageTabLabels) as PageTab[]).map((key) => (
          <ToggleGroupItem key={key} value={key} aria-label={pageTabLabels[key]}>
            {pageTabLabels[key]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {tab === "views" ? (
        <InsightsDataTable
          variant={variant}
          showRank
          rows={data.topPages}
          rowKey={(row) => row.path}
          columns={[
            pathColumn,
            {
              key: "views",
              header: metricHeader,
              align: "right",
              format: (row) => formatCount(row.views),
            },
          ]}
          emptyMessage="Aucune page pour cette période."
        />
      ) : tab === "entries" ? (
        <InsightsDataTable
          variant={variant}
          showRank
          rows={data.landings}
          rowKey={(row) => row.path}
          columns={[
            pathColumn,
            {
              key: "entries",
              header: metricHeader,
              align: "right",
              format: (row) => formatCount(row.entries),
            },
          ]}
          emptyMessage="Aucune page pour cette période."
        />
      ) : (
        <InsightsDataTable
          variant={variant}
          showRank
          rows={data.exits}
          rowKey={(row) => row.path}
          columns={[
            pathColumn,
            {
              key: "exits",
              header: metricHeader,
              align: "right",
              format: (row) => formatCount(row.exits),
            },
          ]}
          emptyMessage="Aucune page pour cette période."
        />
      )}
    </div>
  );
}
