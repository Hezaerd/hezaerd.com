import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const authFunctions: AuthFunctions = internal.auth;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
  authFunctions,
});

export const { authKitEvent } = authKit.events({
  "user.created": async (ctx, event) => {
    const name = [event.data.firstName, event.data.lastName].filter(Boolean).join(" ").trim();
    await ctx.db.insert("users", {
      authId: event.data.id,
      email: event.data.email,
      name: name || event.data.email,
      pictureUrl: event.data.profilePictureUrl ?? undefined,
    });
  },
  "user.updated": async (ctx, event) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", event.data.id))
      .unique();
    if (!user) {
      console.warn(`User not found for update: ${event.data.id}`);
      return;
    }
    const name = [event.data.firstName, event.data.lastName].filter(Boolean).join(" ").trim();
    await ctx.db.patch(user._id, {
      email: event.data.email,
      name: name || event.data.email,
      pictureUrl: event.data.profilePictureUrl ?? undefined,
    });
  },
  "user.deleted": async (ctx, event) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", event.data.id))
      .unique();
    if (!user) {
      console.warn(`User not found for delete: ${event.data.id}`);
      return;
    }
    await ctx.db.delete(user._id);
  },
});

export const { backfillUsers } = authKit.utils();

const authUserValidator = v.object({
  id: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  createdAt: v.string(),
  updatedAt: v.string(),
  firstName: v.optional(v.union(v.string(), v.null())),
  lastName: v.optional(v.union(v.string(), v.null())),
  name: v.optional(v.union(v.string(), v.null())),
  profilePictureUrl: v.optional(v.union(v.string(), v.null())),
  externalId: v.optional(v.union(v.string(), v.null())),
  lastSignInAt: v.optional(v.union(v.string(), v.null())),
  locale: v.optional(v.union(v.string(), v.null())),
  metadata: v.record(v.string(), v.any()),
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(authUserValidator, v.null()),
  handler: async (ctx) => {
    return await authKit.getAuthUser(ctx);
  },
});
