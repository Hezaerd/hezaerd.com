import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

import { CmsDeskContent } from "@/components/cms/cms-desk-content";
import { clientBySlugQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/op/clients/$clientId/cms")({
  component: ClientDeskCmsPage,
});

function ClientDeskCmsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null) {
    return null;
  }

  return <CmsDeskContent clientId={clientId} />;
}
