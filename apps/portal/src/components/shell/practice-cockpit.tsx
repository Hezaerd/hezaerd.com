import NumberFlow, { NumberFlowGroup, type Format } from "@number-flow/react";
import {
  AnalyticsUpIcon,
  Briefcase01Icon,
  DollarSquareIcon,
  MoneyBag01Icon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { type PracticeCockpitStats } from "@/lib/portal-fixtures";

type PracticeCockpitProps = {
  stats: PracticeCockpitStats;
};

type TileConfig = {
  key: keyof PracticeCockpitStats;
  label: string;
  format?: Format;
  icon: IconSvgElement;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
};

const emptyStats: PracticeCockpitStats = {
  openInvoiceTotal: 0,
  paidThisMonth: 0,
  clientsWaiting: 0,
  activeClients: 0,
};

const tiles: TileConfig[] = [
  {
    key: "openInvoiceTotal",
    label: "Factures ouvertes",
    format: { style: "currency", currency: "EUR", maximumFractionDigits: 0 },
    icon: DollarSquareIcon,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    highlight: true,
  },
  {
    key: "paidThisMonth",
    label: "Encaissé ce mois",
    format: { style: "currency", currency: "EUR", maximumFractionDigits: 0 },
    icon: MoneyBag01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  {
    key: "clientsWaiting",
    label: "En attente de vous",
    icon: Target01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  {
    key: "activeClients",
    label: "Clients actifs",
    icon: Briefcase01Icon,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
];

export function PracticeCockpit({ stats }: PracticeCockpitProps) {
  const [live, setLive] = useState(emptyStats);

  useEffect(() => {
    setLive(stats);
  }, [stats]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Un aperçu en direct de votre activité freelance.
          </p>
        </div>
        <div className="bg-muted/30 text-muted-foreground flex items-center gap-1.5 rounded-lg px-3 py-1.5">
          <HugeiconsIcon icon={AnalyticsUpIcon} size={13} />
          <span className="font-mono text-[10px] font-medium tracking-wide uppercase">En direct</span>
        </div>
      </div>

      <NumberFlowGroup>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.key}
              className={`border-border relative flex flex-col gap-3 rounded-xl border px-4 py-4 transition-colors ${
                tile.highlight ? "bg-primary/5 border-primary/20" : "bg-muted/20 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tile.iconBg}`}>
                  <HugeiconsIcon icon={tile.icon} size={15} className={tile.iconColor} />
                </div>
              </div>
              <div>
                <NumberFlow
                  value={live[tile.key]}
                  locales="fr-FR"
                  format={tile.format}
                  className={`font-display text-3xl font-semibold tracking-tight tabular-nums ${
                    tile.highlight ? "text-primary" : ""
                  }`}
                  style={{ lineHeight: 0.85 }}
                />
                <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase">
                  {tile.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </NumberFlowGroup>
    </section>
  );
}
