import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { usePortalSession } from "@/lib/portal-session";

/**
 * Convex queries must not run in route loaders — loaders execute before WorkOS
 * auth is attached to the Convex client. Prefetch from authenticated layouts instead.
 */
export function usePrefetchWhenAuthenticated(prefetch: (queryClient: QueryClient) => void) {
  const queryClient = useQueryClient();
  const { viewerLoading, convexConfigured, authUser } = usePortalSession();

  useEffect(() => {
    if (!convexConfigured || !authUser || viewerLoading) {
      return;
    }
    prefetch(queryClient);
  }, [authUser, convexConfigured, viewerLoading, prefetch, queryClient]);
}
