import {
  AnalyticsUpIcon,
  Briefcase01Icon,
  DollarSquareIcon,
  MoneyBag01Icon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import {
  formatCurrency,
  type PracticeCockpitStats,
} from "@/lib/portal-fixtures";

type PracticeCockpitProps = {
  stats: PracticeCockpitStats;
};

type TileConfig = {
  key: keyof PracticeCockpitStats;
  label: string;
  format: (value: number) => string;
  icon: React.ComponentType;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
};

const tiles: TileConfig[] = [
  {
    key: "openInvoiceTotal",
    label: "Open invoices",
    format: (v) => formatCurrency(v),
    icon: DollarSquareIcon,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    highlight: true,
  },
  {
    key: "paidThisMonth",
    label: "Paid this month",
    format: (v) => formatCurrency(v),
    icon: MoneyBag01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  {
    key: "clientsWaiting",
    label: "Waiting on you",
    format: (v) => String(v),
    icon: Target01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  {
    key: "activeClients",
    label: "Active clients",
    format: (v) => String(v),
    icon: Briefcase01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
];

export function PracticeCockpit({ stats }: PracticeCockpitProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Practice Cockpit
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            A live snapshot of your freelance practice.
          </p>
        </div>
        <div className="bg-muted/30 text-muted-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5">
          <HugeiconsIcon icon={AnalyticsUpIcon} size={13} />
          <span className="font-mono text-[10px] font-medium tracking-wide uppercase">
            Live
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className={`border-border relative flex flex-col gap-3 rounded-xl border px-4 py-4 transition-colors ${
              tile.highlight
                ? "bg-primary/5 border-primary/20"
                : "bg-muted/20 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${tile.iconBg}`}
              >
                <HugeiconsIcon
                  icon={tile.icon}
                  size={15}
                  className={tile.iconColor}
                />
              </div>
            </div>
            <div>
              <p
                className={`font-display text-3xl font-semibold tracking-tight ${
                  tile.highlight ? "text-primary" : ""
                }`}
              >
                {tile.format(stats[tile.key])}
              </p>
              <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase">
                {tile.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
