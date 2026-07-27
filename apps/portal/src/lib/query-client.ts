import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";

import { convex } from "@/lib/convex-client";

let portalQueryClient: QueryClient | undefined;

export function getPortalQueryClient(): QueryClient {
  if (portalQueryClient) {
    return portalQueryClient;
  }

  if (convex) {
    const convexQueryClient = new ConvexQueryClient(convex);
    portalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
          gcTime: 5 * 60 * 1000,
        },
      },
    });
    convexQueryClient.connect(portalQueryClient);
    return portalQueryClient;
  }

  portalQueryClient = new QueryClient();
  return portalQueryClient;
}
