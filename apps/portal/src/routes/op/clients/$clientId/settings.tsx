import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { ClientAccessPanel } from "@/components/client-access-panel";
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
    <div className="flex max-w-3xl flex-col gap-6">
      <ClientAccessPanel clientSlug={clientId} clientName={client.name} />
    </div>
  );
}
