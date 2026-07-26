import { api } from "@hezaerd/backend/api";
import { Switch } from "@hezaerd/ui/components/switch";
import { Globe02Icon, PieChart01Icon, Setting07Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useMutation, useQuery } from "convex/react";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { type ClientFeature, toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId")({
  component: ClientRecordPage,
});

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientRecordPage() {
  const { clientId } = Route.useParams();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });
  const setFeature = useMutation(api.clients.setFeature);

  if (clientDoc === undefined) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);
  const initials = getClientInitials(client.name);

  async function toggleFeature(feature: ClientFeature, enabled: boolean) {
    await setFeature({ slug: clientId, feature, enabled });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="border-border bg-muted/20 flex items-center gap-4 rounded-xl border px-5 py-5">
        <div className="bg-primary/10 border-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
          <span className="text-primary font-mono text-sm font-semibold tracking-wider">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{client.contactEmail}</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Setting07Icon} size={14} className="text-muted-foreground" />
          </div>
          <h2 className="font-display text-base font-semibold tracking-tight">Fonctionnalités</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Activez les zones au-delà de l&apos;essentiel (Accueil, Factures, Fichiers). Les
          changements s&apos;appliquent immédiatement.
        </p>

        <div className="border-border bg-muted/20 divide-border flex flex-col divide-y overflow-hidden rounded-xl border">
          <FeatureToggleRow
            icon={PieChart01Icon}
            label="Statistiques"
            description="Visiteurs, pages populaires et un enseignement clair."
            checked={client.features.insights}
            onCheckedChange={(checked) => toggleFeature("insights", checked)}
          />
          <FeatureToggleRow
            icon={Globe02Icon}
            label="Site web"
            description="Champs guidés avec aperçu avant publication."
            checked={client.features.website}
            onCheckedChange={(checked) => toggleFeature("website", checked)}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureToggleRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: IconSvgElement;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
