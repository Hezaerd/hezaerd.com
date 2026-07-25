import { api } from "@hezaerd/backend/api";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

const convexConfigured =
  typeof import.meta.env.VITE_CONVEX_URL === "string" &&
  import.meta.env.VITE_CONVEX_URL.length > 0;

export type PortalRole = "operator" | "client";

export function usePortalViewer() {
  const { user: workosUser, loading: authLoading } = useAuth();
  const ensureAccess = useMutation(api.users.ensureAccess);
  const [accessReady, setAccessReady] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const ensuringRef = useRef(false);

  useEffect(() => {
    if (!convexConfigured || !workosUser || accessReady || ensuringRef.current) {
      return;
    }

    ensuringRef.current = true;
    ensureAccess({})
      .then(() => {
        setAccessReady(true);
        return undefined;
      })
      .catch((error: unknown) => {
        setAccessError(error instanceof Error ? error.message : "Synchronisation impossible");
        setAccessReady(true);
      });
  }, [workosUser, ensureAccess, accessReady]);

  const me = useQuery(
    api.users.me,
    convexConfigured && workosUser && accessReady ? {} : "skip",
  );

  const loading =
    authLoading ||
    (Boolean(workosUser) && convexConfigured && (!accessReady || me === undefined));

  const role = me?.role ?? null;
  const clientSlug = me?.clientSlug ?? null;

  return {
    user: me ?? null,
    role,
    clientSlug,
    isOperator: role === "operator",
    isClient: role === "client",
    isUnlinked: role === "client" && !clientSlug,
    loading,
    accessError,
    convexConfigured,
    workosUser,
  };
}
