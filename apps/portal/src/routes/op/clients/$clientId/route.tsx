import { Suspense, useCallback } from "react";

import { type QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Link, Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { ClientDeskNav } from "@/components/shell/client-desk-nav";
import { ClientAccessPanel } from "@/components/client-access-panel";
import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";
import { clientBySlugQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";
import { usePrefetchWhenAuthenticated } from "@/lib/use-prefetch-when-authenticated";

export const Route = createFileRoute("/op/clients/$clientId")({
  component: ClientDeskLayout,
});

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientDeskLayout() {
  const { clientId } = Route.useParams();

  const prefetchDesk = useCallback(
    (queryClient: QueryClient) => {
      void queryClient.prefetchQuery(clientBySlugQuery(clientId));
    },
    [clientId],
  );

  usePrefetchWhenAuthenticated(prefetchDesk);

  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);
  const initials = getClientInitials(client.name);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
            <span className="text-primary font-mono text-xs font-semibold tracking-wider">
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold tracking-tight">{client.name}</p>
            <p className="text-muted-foreground text-xs">{client.contactEmail}</p>
          </div>
          <Link
            to="/op/clients"
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            ← Clients
          </Link>
        </div>
        <ClientDeskNav clientId={clientId} />
      </div>
      <ClientAccessPanel clientSlug={clientId} clientName={client.name} />
      <Suspense fallback={<PageContentSkeleton />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
