import { v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/functions";
import { tryBindSeatByEmail } from "./lib/clients";
import { enrichUserWithClient, resolveRole } from "./lib/users";

const portalRoleValidator = v.union(v.literal("operator"), v.literal("client"));

export const portalUserValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  authId: v.string(),
  email: v.string(),
  name: v.string(),
  pictureUrl: v.optional(v.string()),
  role: portalRoleValidator,
  clientId: v.optional(v.id("clients")),
  clientSlug: v.union(v.string(), v.null()),
});

/** Current app user profile (requires WorkOS JWT + webhook-synced `users` row). */
export const me = authedQuery({
  args: {},
  returns: portalUserValidator,
  handler: async (ctx) => {
    return await enrichUserWithClient(ctx, ctx.user);
  },
});

/** Backfill role and attempt Client seat bind after sign-in. Call once when Portal loads. */
export const ensureAccess = authedMutation({
  args: {},
  returns: portalUserValidator,
  handler: async (ctx) => {
    const role = resolveRole(ctx.user.email);
    await ctx.db.patch(ctx.user._id, { role });
    await tryBindSeatByEmail(ctx, ctx.user._id, ctx.user.email);

    const updated = await ctx.db.get("users", ctx.user._id);
    if (!updated) {
      throw new Error("User profile not synced yet");
    }

    return await enrichUserWithClient(ctx, updated);
  },
});
