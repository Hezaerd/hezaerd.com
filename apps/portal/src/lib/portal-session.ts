/**
 * Portal session — auth identity, app role/seat, and home-shell destination.
 *
 * Role stays app-owned (`operator` | `client` via OPERATOR_EMAILS + seat bind).
 * Callers should route through resolve* helpers instead of re-implementing gates.
 */
import { api } from "@hezaerd/backend/api";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

const workosConfigured =
  typeof import.meta.env.VITE_WORKOS_CLIENT_ID === "string" &&
  import.meta.env.VITE_WORKOS_CLIENT_ID.length > 0;

const convexConfigured =
  typeof import.meta.env.VITE_CONVEX_URL === "string" && import.meta.env.VITE_CONVEX_URL.length > 0;

export type PortalRole = "operator" | "client";

export type PortalAuthUser = {
  email: string;
  firstName?: string;
  lastName?: string;
};

/** Snapshot used by pure routing helpers (and tests). */
export type PortalSessionSnapshot = {
  authLoading: boolean;
  authUser: PortalAuthUser | null;
  convexConfigured: boolean;
  viewerLoading: boolean;
  accessError: string | null;
  role: PortalRole | null;
  clientSlug: string | null;
};

export type PortalHome =
  | { kind: "loading" }
  | { kind: "login" }
  | { kind: "error"; message: string }
  | { kind: "operator-home" }
  | { kind: "unlinked" }
  | { kind: "client-home"; slug: string };

export type OperatorShellGate =
  | { kind: "loading" }
  | { kind: "login" }
  | { kind: "allow"; email: string }
  | { kind: "unlinked" }
  | { kind: "client-home"; slug: string };

/** Gate for `/w/{slug}` — Operators never stay in Client Workspace chrome. */
export type WorkspaceGate =
  | { kind: "loading" }
  | { kind: "login" }
  | { kind: "operator-desk"; slug: string }
  | { kind: "load-client" };

export function resolvePortalHome(session: PortalSessionSnapshot): PortalHome {
  if (session.authLoading) {
    return { kind: "loading" };
  }
  if (!session.authUser) {
    return { kind: "login" };
  }
  if (!session.convexConfigured) {
    // Local preview without Convex: preserve Operator Home as the sandbox shell.
    return { kind: "operator-home" };
  }
  if (session.viewerLoading) {
    return { kind: "loading" };
  }
  if (session.accessError) {
    return { kind: "error", message: session.accessError };
  }
  if (session.role === "operator") {
    return { kind: "operator-home" };
  }
  if (session.role === "client") {
    if (!session.clientSlug) {
      return { kind: "unlinked" };
    }
    return { kind: "client-home", slug: session.clientSlug };
  }
  // Signed in but no app role (e.g. WorkOS unset while Convex URL is set): Operator Home sandbox.
  return { kind: "operator-home" };
}

export function resolveOperatorShell(session: PortalSessionSnapshot): OperatorShellGate {
  if (session.authLoading) {
    return { kind: "loading" };
  }
  if (!session.authUser) {
    return { kind: "login" };
  }
  if (session.convexConfigured) {
    if (session.viewerLoading) {
      return { kind: "loading" };
    }
    if (session.role === "client") {
      if (!session.clientSlug) {
        return { kind: "unlinked" };
      }
      return { kind: "client-home", slug: session.clientSlug };
    }
  }
  return { kind: "allow", email: session.authUser.email };
}

export function resolveWorkspaceGate(session: PortalSessionSnapshot, slug: string): WorkspaceGate {
  if (session.authLoading) {
    return { kind: "loading" };
  }
  if (!session.authUser) {
    return { kind: "login" };
  }
  if (session.convexConfigured) {
    if (session.viewerLoading) {
      return { kind: "loading" };
    }
    if (session.role === "operator") {
      return { kind: "operator-desk", slug };
    }
  }
  return { kind: "load-client" };
}

function readAuthUser(workos: ReturnType<typeof useAuth>): {
  authUser: PortalAuthUser | null;
  authLoading: boolean;
} {
  if (!workosConfigured) {
    return {
      authUser: { email: "dev@hezaerd.com", firstName: "Dev", lastName: "User" },
      authLoading: false,
    };
  }
  if (workos.loading) {
    return { authUser: null, authLoading: true };
  }
  if (!workos.user) {
    return { authUser: null, authLoading: false };
  }
  return {
    authUser: {
      email: workos.user.email,
      firstName: workos.user.firstName ?? undefined,
      lastName: workos.user.lastName ?? undefined,
    },
    authLoading: false,
  };
}

/**
 * Single hook for Portal chrome and route gates.
 * Runs ensureAccess once per signed-in visit when Convex is configured.
 */
export function usePortalSession() {
  const workos = useAuth();
  const { authUser, authLoading } = readAuthUser(workos);

  const ensureAccess = useMutation(api.users.ensureAccess);
  const [accessReady, setAccessReady] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const ensuringRef = useRef(false);

  useEffect(() => {
    if (!convexConfigured || !workos.user || accessReady || ensuringRef.current) {
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
  }, [workos.user, ensureAccess, accessReady]);

  const me = useQuery(api.users.me, convexConfigured && workos.user && accessReady ? {} : "skip");

  const viewerLoading =
    Boolean(workos.user) && convexConfigured && (!accessReady || me === undefined);

  const role = me?.role ?? null;
  const clientSlug = me?.clientSlug ?? null;

  const snapshot: PortalSessionSnapshot = {
    authLoading,
    authUser,
    convexConfigured,
    viewerLoading,
    accessError,
    role,
    clientSlug,
  };

  return {
    ...snapshot,
    me: me ?? null,
    isOperator: role === "operator",
    isClient: role === "client",
    isUnlinked: role === "client" && !clientSlug,
    loading: authLoading || viewerLoading,
    home: resolvePortalHome(snapshot),
    operatorShell: resolveOperatorShell(snapshot),
    workspaceGateFor(slug: string): WorkspaceGate {
      return resolveWorkspaceGate(snapshot, slug);
    },
  };
}
