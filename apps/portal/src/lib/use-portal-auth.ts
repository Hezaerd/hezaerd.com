/**
 * Thin wrapper around WorkOS `useAuth` that falls back to a synthetic dev
 * user when WorkOS credentials are not configured (local preview / v0 sandbox).
 *
 * In production the real `useAuth` values are always returned unchanged.
 */
import { useAuth } from "@workos/authkit-tanstack-react-start/client";

const workosConfigured =
  typeof import.meta.env.VITE_WORKOS_CLIENT_ID === "string" &&
  import.meta.env.VITE_WORKOS_CLIENT_ID.length > 0;

export type PortalUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

export function usePortalAuth(): {
  user: PortalUser | null;
  loading: boolean;
} {
  const workos = useAuth();

  // If WorkOS isn't configured (dev / sandbox) return a synthetic user so
  // all portal shells render without authentication.
  if (!workosConfigured) {
    return {
      user: { email: "dev@hezaerd.com", firstName: "Dev", lastName: "User" },
      loading: false,
    };
  }

  if (workos.loading) {
    return { user: null, loading: true };
  }

  if (!workos.user) {
    return { user: null, loading: false };
  }

  return {
    user: {
      email: workos.user.email,
      firstName: workos.user.firstName ?? undefined,
      lastName: workos.user.lastName ?? undefined,
    },
    loading: false,
  };
}
