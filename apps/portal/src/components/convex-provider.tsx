import {
  AuthKitProvider,
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { ConvexProviderWithAuth } from "convex/react";
import { useCallback, useMemo, type ReactNode } from "react";

import { convex } from "@/lib/convex-client";
import type { WorkosInitialAuth } from "@/lib/workos-auth";

type PortalConvexProviderProps = {
  children: ReactNode;
  initialAuth?: WorkosInitialAuth;
};

export function PortalConvexProvider({ children, initialAuth }: PortalConvexProviderProps) {
  if (!convex) {
    return <AuthKitProvider initialAuth={initialAuth}>{children}</AuthKitProvider>;
  }

  return (
    <AuthKitProvider initialAuth={initialAuth}>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromWorkOS}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useConvexAuthFromWorkOS() {
  const { user, loading: authLoading } = useAuth();
  const { getAccessToken, loading: tokenLoading } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        if (forceRefreshToken) {
          return (await getAccessToken()) ?? null;
        }
        return (await getAccessToken()) ?? null;
      } catch {
        return null;
      }
    },
    [getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading: authLoading || tokenLoading,
      isAuthenticated: Boolean(user),
      fetchAccessToken,
    }),
    [authLoading, tokenLoading, user, fetchAccessToken],
  );
}
