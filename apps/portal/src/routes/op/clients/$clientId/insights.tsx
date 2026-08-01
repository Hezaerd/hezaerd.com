import { api } from "@hezaerd/backend/api";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useConvex } from "convex/react";

import { DeskInsightsSetupPanel } from "@/components/insights/desk-insights-setup-panel";
import {
  ClientDeskPage,
  ClientDeskPageHeader,
  DeskEmptyState,
} from "@/components/shell/client-desk-layout";
import { analyticsSiteForDeskQueryKey, clientBySlugQuery } from "@/lib/convex-queries";
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
    <ClientDeskPage>
      <ClientDeskPageHeader title="Statistiques" />
      <DeskInsightsSiteContent clientId={clientId} />
    </ClientDeskPage>
  );
}

function DeskInsightsSiteContent({ clientId }: { clientId: string }) {
  const convex = useConvex();

  const { data: site } = useSuspenseQuery({
    queryKey: analyticsSiteForDeskQueryKey(clientId),
    queryFn: async () => {
      const existing = await convex.query(api.analytics.getSiteForDesk, { slug: clientId });
      if (existing) {
        return existing;
      }
      return await convex.mutation(api.analytics.ensureSiteForDesk, { slug: clientId });
    },
  });

  if (!site) {
    return <DeskEmptyState title="Site analytics introuvable." />;
  }

  return <DeskInsightsSetupPanel clientId={clientId} site={site} />;
}
