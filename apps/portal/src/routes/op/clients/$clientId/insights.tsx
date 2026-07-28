import { createFileRoute } from "@tanstack/react-router";

import {
  ClientDeskPage,
  ClientDeskPageHeader,
  DeskEmptyState,
} from "@/components/shell/client-desk-layout";

export const Route = createFileRoute("/op/clients/$clientId/insights")({
  component: ClientDeskInsightsPage,
});

function ClientDeskInsightsPage() {
  return (
    <ClientDeskPage>
      <ClientDeskPageHeader title="Statistiques" />
      <DeskEmptyState title="À venir." />
    </ClientDeskPage>
  );
}
