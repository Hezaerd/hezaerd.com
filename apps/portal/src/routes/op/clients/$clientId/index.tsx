import { Switch } from "@hezaerd/ui/components/switch";
import { PieChart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import {
  ClientDeskPage,
  DeskCard,
  DeskCardHeader,
} from "@/components/shell/client-desk-layout";
import { ClientSitePreview } from "@/components/site/client-site-preview";
import { clientBySlugQuery, waitingOnClientQuery } from "@/lib/convex-queries";
import { useSetFeatureMutation } from "@/lib/convex-optimistic";
import { type ClientFeature, toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/")({
  component: ClientDeskIndexPage,
});

function ClientDeskIndexPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: waitingOnClient } = useSuspenseQuery(waitingOnClientQuery(clientId));
  const setFeature = useSetFeatureMutation();

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  function toggleFeature(feature: ClientFeature, enabled: boolean) {
    void setFeature({ slug: clientId, feature, enabled });
  }

  return (
    <ClientDeskPage wide>
      {client.linkedSite ? (
        <ClientSitePreview
          clientSlug={clientId}
          clientName={client.name}
          linkedSite={client.linkedSite}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(18rem,100%)]">
        <aside className="flex flex-col gap-4">
          <QueuePanel title="En attente du client" clientId={clientId} items={waitingOnClient} />
          <QueuePanel title="A besoin de toi" />
        </aside>

        <section className="min-w-0">
          <DeskCard className="divide-border divide-y gap-0 p-0">
            <FeatureToggleRow
              icon={PieChart01Icon}
              label="Statistiques"
              checked={client.features.insights}
              onCheckedChange={(checked) => toggleFeature("insights", checked)}
            />
          </DeskCard>
        </section>
      </div>
    </ClientDeskPage>
  );
}

function QueuePanel({
  title,
  clientId,
  items = [],
}: {
  title: string;
  clientId?: string;
  items?: Array<{ id: string; title: string; description: string; href: string }>;
}) {
  return (
    <DeskCard className="gap-3">
      <DeskCardHeader title={title} />
      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="border-border bg-background/60 hover:bg-background rounded-lg border px-3 py-2 transition-colors"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </DeskCard>
  );
}

function FeatureToggleRow({
  icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: IconSvgElement;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground" />
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
