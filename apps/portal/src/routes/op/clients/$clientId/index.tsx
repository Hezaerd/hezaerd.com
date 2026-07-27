import { api } from "@hezaerd/backend/api";
import { Switch } from "@hezaerd/ui/components/switch";
import { Globe02Icon, PieChart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";

import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { clientBySlugQuery, waitingOnClientQuery } from "@/lib/convex-queries";
import { type ClientFeature, toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/")({
  component: ClientDeskIndexPage,
});

function ClientDeskIndexPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: waitingOnClient } = useSuspenseQuery(waitingOnClientQuery(clientId));
  const setFeature = useMutation(api.clients.setFeature);

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  async function toggleFeature(feature: ClientFeature, enabled: boolean) {
    await setFeature({ slug: clientId, feature, enabled });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <QueuePanel
          title="En attente du client"
          description="Actions qui nécessitent une réponse du client."
          emptyMessage="Rien en attente."
          clientId={clientId}
          items={waitingOnClient}
        />
        <QueuePanel
          title="En attente de l'opérateur"
          description="Actions qui vous reviennent."
          emptyMessage="Rien en attente."
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Globe02Icon} size={14} className="text-muted-foreground" />
          </div>
          <h2 className="font-display text-base font-semibold tracking-tight">Fonctionnalités</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Activez les zones au-delà de l&apos;essentiel. Les changements s&apos;appliquent
          immédiatement.
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

function QueuePanel({
  title,
  description,
  emptyMessage,
  clientId,
  items = [],
}: {
  title: string;
  description: string;
  emptyMessage: string;
  clientId?: string;
  items?: Array<{ id: string; title: string; description: string; href: string }>;
}) {
  return (
    <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border px-5 py-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{description}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to="/op/clients/$clientId/invoices"
              params={{ clientId: clientId ?? "" }}
              className="border-border bg-background/60 hover:bg-background rounded-lg border px-3 py-2 transition-colors"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </Link>
          ))}
        </div>
      )}
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
