import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { DeskInsightsDashboard } from "@/components/insights/desk-insights-dashboard";
import {
  ClientDeskPage,
  ClientDeskPageHeader,
} from "@/components/shell/client-desk-layout";
import { clientBySlugQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/insights")({
  component: ClientDeskInsightsPage,
});

function ClientDeskInsightsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  if (!client.linkedSite) {
    return (
      <ClientDeskPage>
        <ClientDeskPageHeader title="Statistiques" />
        <Empty className="border-border bg-muted/20 rounded-xl border border-dashed py-12">
          <EmptyHeader>
            <EmptyTitle className="font-display text-base font-semibold tracking-tight">
              Liez un site pour commencer la collecte
            </EmptyTitle>
            <EmptyDescription>
              Configure l&apos;URL de production dans{" "}
              <Link
                to="/op/clients/$clientId/settings"
                params={{ clientId }}
                className="text-foreground font-medium"
              >
                Paramètres
              </Link>
              .
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </ClientDeskPage>
    );
  }

  return (
    <ClientDeskPage wide>
      <ClientDeskPageHeader title="Statistiques" />
      <DeskInsightsDashboard
        clientId={clientId}
        insightsEnabled={client.features.insights}
      />
    </ClientDeskPage>
  );
}
