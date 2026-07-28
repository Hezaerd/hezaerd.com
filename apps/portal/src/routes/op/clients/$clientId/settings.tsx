import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { ClientAccessPanel } from "@/components/client-access-panel";
import { ClientFileSettingsForm } from "@/components/files/client-file-settings-form";
import { LinkedSiteSettingsPanel } from "@/components/sites/linked-site-settings-panel";
import { clientBySlugQuery, siteSnapshotQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/settings")({
  component: ClientDeskSettingsPage,
});

function ClientDeskSettingsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: siteSnapshot } = useSuspenseQuery(siteSnapshotQuery(clientId));

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <ClientAccessPanel clientSlug={clientId} clientName={client.name} />
      <LinkedSiteSettingsPanel
        client={client}
        hasActiveDeployToken={siteSnapshot?.hasActiveDeployToken ?? false}
      />
      <ClientFileSettingsForm client={client} />
    </div>
  );
}
