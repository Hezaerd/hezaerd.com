import { Suspense, useCallback, useLayoutEffect, useMemo } from "react";

import { type QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { ClientDeskBackLink } from "@/components/shell/client-desk-back-link";
import { ClientDeskIdentity, getClientInitials } from "@/components/shell/client-desk-header";
import { ClientDeskNav } from "@/components/shell/client-desk-nav";
import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";
import type { OperatorChromeOverrides } from "@/components/shell/operator-chrome-context";
import { useSetOperatorChromeOverrides } from "@/components/shell/operator-chrome-context";
import { clientBySlugQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";
import { usePrefetchWhenAuthenticated } from "@/lib/use-prefetch-when-authenticated";

export const Route = createFileRoute("/op/clients/$clientId")({
  component: ClientDeskLayout,
});

function ClientDeskLayout() {
  const { clientId } = Route.useParams();
  const setChromeOverrides = useSetOperatorChromeOverrides();

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

  const chromeOverrides = useMemo(
    (): OperatorChromeOverrides => ({
      headerStart: <ClientDeskBackLink />,
      headerTitle: null,
    }),
    [],
  );

  useLayoutEffect(() => {
    setChromeOverrides(chromeOverrides);
    return () => setChromeOverrides({});
  }, [chromeOverrides, setChromeOverrides]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
        <ClientDeskIdentity client={client} initials={initials} className="self-end xl:order-2" />
        <ClientDeskNav clientId={clientId} className="xl:order-1 xl:min-w-0 xl:flex-1" />
      </div>
      <Suspense fallback={<PageContentSkeleton />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
