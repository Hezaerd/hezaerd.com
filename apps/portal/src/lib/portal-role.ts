import { getFirstClient } from "@/lib/portal-fixtures";

export type PortalRole = "operator" | "client";

export function resolvePortalRole(): PortalRole {
  const envRole = import.meta.env.VITE_PORTAL_ROLE;
  if (envRole === "operator" || envRole === "client") {
    return envRole;
  }
  return "operator";
}

export function isOperatorRole(): boolean {
  return resolvePortalRole() === "operator";
}

export function isClientRole(): boolean {
  return resolvePortalRole() === "client";
}

export function getClientWorkspaceHomeParams() {
  return { clientId: getFirstClient().id };
}
