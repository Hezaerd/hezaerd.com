import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

import { authKit } from "../auth";
import { getClientBySlug, normalizeEmail } from "./clients";

type DbCtx = QueryCtx | MutationCtx;

export type PortalRole = "operator" | "client";

const DEFAULT_OPERATOR_EMAILS = ["hezaerd@hezaerd.com"];

export function getOperatorEmails(): string[] {
  const raw = process.env.OPERATOR_EMAILS;
  if (!raw || raw.trim().length === 0) {
    return DEFAULT_OPERATOR_EMAILS;
  }
  return raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
}

export function isOperatorEmail(email: string): boolean {
  return getOperatorEmails().includes(normalizeEmail(email));
}

export function resolveRole(email: string): PortalRole {
  return isOperatorEmail(email) ? "operator" : "client";
}

export async function enrichUserWithClient(
  ctx: DbCtx,
  user: Doc<"users">,
): Promise<{
  _id: Doc<"users">["_id"];
  _creationTime: number;
  authId: string;
  email: string;
  name: string;
  pictureUrl?: string;
  role: PortalRole;
  clientId?: Doc<"users">["clientId"];
  clientSlug: string | null;
}> {
  let clientSlug: string | null = null;
  if (user.clientId) {
    const client = await ctx.db.get("clients", user.clientId);
    clientSlug = client?.slug ?? null;
  }

  return {
    _id: user._id,
    _creationTime: user._creationTime,
    authId: user.authId,
    email: user.email,
    name: user.name,
    pictureUrl: user.pictureUrl,
    role: user.role,
    clientId: user.clientId,
    clientSlug,
  };
}

export async function requireOperator(ctx: DbCtx, user: Doc<"users">): Promise<void> {
  if (user.role !== "operator") {
    throw new Error("Unauthorized: Operator access required");
  }
}

export async function assertClientAccess(
  ctx: DbCtx,
  user: Doc<"users">,
  slug: string,
): Promise<Doc<"clients">> {
  const client = await getClientBySlug(ctx, slug);
  if (!client) {
    throw new Error("Client not found");
  }

  if (user.role === "operator") {
    return client;
  }

  if (user.role === "client" && user.clientId === client._id) {
    return client;
  }

  throw new Error("Unauthorized: You don't have access to this Client");
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof authKit.getAuthUser>>>;

export async function getAuthUser(ctx: DbCtx): Promise<AuthUser | null> {
  return await authKit.getAuthUser(ctx);
}

export async function requireAuthUser(ctx: DbCtx): Promise<AuthUser> {
  const authUser = await getAuthUser(ctx);
  if (!authUser) {
    throw new Error("Not authenticated");
  }
  return authUser;
}

export async function getAppUser(ctx: DbCtx): Promise<Doc<"users"> | null> {
  const authUser = await getAuthUser(ctx);
  if (!authUser) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authUser.id))
    .unique();
}

export async function requireAppUser(ctx: DbCtx): Promise<{
  authUser: AuthUser;
  user: Doc<"users">;
}> {
  const authUser = await requireAuthUser(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authUser.id))
    .unique();
  if (!user) {
    throw new Error("User profile not synced yet");
  }
  return { authUser, user };
}
