import { Button } from "@hezaerd/ui/components/button";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { Link, createFileRoute } from "@tanstack/react-router";

import { PracticeCockpit } from "@/components/shell/practice-cockpit";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/")({
  component: OperatorHomePage,
});

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function OperatorHomePage() {
  const clients = useQuery(api.clients.list);
  const stats = useQuery(api.clients.stats);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (clients === undefined || stats === undefined) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          {dateStr}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Bon retour.</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Voici un aperçu de votre activité et des bureaux clients.
        </p>
      </div>

      <PracticeCockpit stats={stats} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">Clients</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Ouvrez le bureau de chaque client.
            </p>
          </div>
          <Button variant="outline" size="sm" render={<Link to="/op/clients" />}>
            Tous les clients
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        </div>

        <div className="grid gap-3">
          {clients.map((clientDoc) => {
            const client = toPortalClient(clientDoc);
            const initials = getClientInitials(client.name);
            const featureList = [
              "Essentiel",
              client.features.insights ? "Statistiques" : null,
              client.features.website ? "Site web" : null,
            ].filter(Boolean);

            return (
              <div
                key={client.id}
                className="border-border bg-muted/20 hover:bg-muted/30 group relative flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors"
              >
                <div className="bg-primary/10 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                  <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                    {initials}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold tracking-tight">{client.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{client.contactEmail}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {featureList.map((f) => (
                      <span
                        key={f}
                        className="border-border bg-muted/50 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    size="sm"
                    render={<Link to="/op/clients/$clientId" params={{ clientId: client.id }} />}
                  >
                    Ouvrir
                    <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
