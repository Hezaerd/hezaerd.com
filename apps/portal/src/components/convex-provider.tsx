import { AuthKitProvider, useAccessToken, useAuth } from "@workos/authkit-tanstack-react-start/client";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useMemo, type ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function PortalConvexProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <AuthKitProvider>{children}</AuthKitProvider>;
  }

  return (
    <AuthKitProvider>
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
