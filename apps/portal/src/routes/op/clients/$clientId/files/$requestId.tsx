import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { OperatorFileRequestDetail } from "@/components/files/operator-file-request-detail";
import { fileRequestQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/op/clients/$clientId/files/$requestId")({
  component: OperatorFileRequestPage,
});

function OperatorFileRequestPage() {
  const { clientId, requestId } = Route.useParams();
  const { data: entry } = useSuspenseQuery(fileRequestQuery(clientId, requestId));

  if (entry === null) {
    throw notFound();
  }

  return <OperatorFileRequestDetail clientId={clientId} entry={entry} />;
}
