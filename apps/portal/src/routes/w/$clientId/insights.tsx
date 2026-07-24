import { AnalyticsUpIcon, ArrowUpRight01Icon, PieChart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/w/$clientId/insights")({
  beforeLoad: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client?.features.insights) {
      throw redirect({
        to: "/w/$clientId",
        params: { clientId: params.clientId },
      });
    }
  },
  component: ClientInsightsPage,
});

function ClientInsightsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={PieChart01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Statistiques</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Trois enseignements clairs sur votre site — sans bruit, juste le signal.
        </p>
      </div>

      {/* Stats row */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          30 derniers jours
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Visitors */}
          <div className="border-border bg-muted/20 relative flex flex-col gap-3 rounded-xl border px-4 py-4">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <HugeiconsIcon icon={AnalyticsUpIcon} size={15} className="text-primary" />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight">1 284</p>
              <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">
                Visiteurs
              </p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} />
              <span className="font-mono text-[10px] font-semibold">+12 % vs mois dernier</span>
            </div>
          </div>

          {/* Top pages */}
          <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border px-4 py-4">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              <HugeiconsIcon icon={PieChart01Icon} size={15} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">Pages populaires</p>
              <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">
                Par visites
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-1.5">
              {["Accueil", "Menu", "Réservations"].map((page, i) => (
                <div key={page} className="flex items-center justify-between">
                  <span className="text-sm">{page}</span>
                  <span className="text-muted-foreground font-mono text-xs">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Takeaway */}
          <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border px-4 py-4">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <HugeiconsIcon icon={AnalyticsUpIcon} size={15} className="text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">Enseignement</p>
              <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">
                En clair
              </p>
            </div>
            <p className="mt-auto text-sm leading-relaxed">
              Les visites de la page réservations ont augmenté — mettez en avant les créneaux du
              week-end sur votre page d&apos;accueil.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
