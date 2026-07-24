import { Card, CardContent, CardHeader, CardTitle } from "@hezaerd/ui/components/card";

import { formatCurrency, type PracticeCockpitStats } from "@/lib/portal-fixtures";

type PracticeCockpitProps = {
  stats: PracticeCockpitStats;
};

const tiles = [
  {
    key: "openInvoiceTotal" as const,
    label: "Open invoice total",
    format: (value: number) => formatCurrency(value),
  },
  {
    key: "paidThisMonth" as const,
    label: "Paid this month",
    format: (value: number) => formatCurrency(value),
  },
  {
    key: "clientsWaiting" as const,
    label: "Clients waiting on you",
    format: (value: number) => String(value),
  },
  {
    key: "activeClients" as const,
    label: "Active Clients",
    format: (value: number) => String(value),
  },
];

export function PracticeCockpit({ stats }: PracticeCockpitProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Practice Cockpit</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Snapshot of open work across your freelance practice.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.key} size="sm" className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {tile.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-semibold tracking-tight">
                {tile.format(stats[tile.key])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
