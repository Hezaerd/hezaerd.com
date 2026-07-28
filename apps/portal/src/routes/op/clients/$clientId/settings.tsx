import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { ClientAccessPanel } from "@/components/client-access-panel";
import { ClientFileSettingsForm } from "@/components/files/client-file-settings-form";
import { ClientLinkedSiteForm } from "@/components/site/client-linked-site-form";
import { ClientDeskPage, ClientDeskPageHeader } from "@/components/shell/client-desk-layout";
import { clientBySlugQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/settings")({
  component: ClientDeskSettingsPage,
});

function ClientDeskSettingsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  return (
    <ClientDeskPage>
      <ClientDeskPageHeader title="Paramètres" />
      <ClientAccessPanel clientSlug={clientId} clientName={client.name} />
      <ClientLinkedSiteForm client={client} />
      <ClientFileSettingsForm client={client} />
    </ClientDeskPage>
  );
}
