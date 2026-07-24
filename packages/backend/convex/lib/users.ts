import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

import { authKit } from "../auth";

type DbCtx = QueryCtx | MutationCtx;

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
