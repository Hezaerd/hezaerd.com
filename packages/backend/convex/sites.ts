import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { createDeployTokenPlain, hashDeployToken } from "./lib/deployToken";
import { operatorMutation, operatorQuery } from "./lib/functions";
import { assertClientAccess } from "./lib/users";
import { hasLinkedSite, validateLinkedSite } from "./lib/sites";

const linkedSiteValidator = v.object({
  githubRepo: v.string(),
  defaultBranch: v.string(),
  productionUrl: v.string(),
});

const siteHealthValidator = v.object({
  status: v.union(
    v.literal("up"),
    v.literal("degraded"),
    v.literal("down"),
    v.literal("unknown"),
  ),
  latencyMs: v.optional(v.number()),
  httpStatus: v.optional(v.number()),
  checkedAt: v.number(),
  consecutiveFailures: v.number(),
});

const siteGitValidator = v.optional(
  v.object({
    branch: v.string(),
    commits: v.array(
      v.object({
        sha: v.string(),
        shortSha: v.string(),
        message: v.string(),
        author: v.string(),
        committedAt: v.number(),
        url: v.string(),
      }),
    ),
    syncedAt: v.number(),
  }),
);

const siteDeployValidator = v.optional(
  v.object({
    status: v.union(v.literal("success"), v.literal("failure"), v.literal("in_progress")),
    commitSha: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    finishedAt: v.number(),
    reportedAt: v.number(),
  }),
);

export const snapshotValidator = v.object({
  linkedSite: linkedSiteValidator,
  health: siteHealthValidator,
  git: siteGitValidator,
  deploy: siteDeployValidator,
  hasActiveDeployToken: v.boolean(),
});

/** Operator view of linked-site piloting data for one Client. */
export const getSnapshot = operatorQuery({
  args: { slug: v.string() },
  returns: v.union(snapshotValidator, v.null()),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!hasLinkedSite(client)) {
      return null;
    }

    const snapshot = await ctx.db
      .query("siteSnapshots")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .unique();

    const activeToken = (
      await ctx.db
        .query("siteDeployTokens")
        .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
        .collect()
    ).some((token) => !token.revokedAt);

    return {
      linkedSite: client.linkedSite!,
      health: snapshot?.health ?? {
        status: "unknown" as const,
        checkedAt: Date.now(),
        consecutiveFailures: 0,
      },
      git: snapshot?.git,
      deploy: snapshot?.deploy,
      hasActiveDeployToken: activeToken,
    };
  },
});

/** Save or update linked-site metadata (Operator). Bootstraps git history. */
export const updateLinkedSite = operatorMutation({
  args: {
    slug: v.string(),
    githubRepo: v.string(),
    defaultBranch: v.string(),
    productionUrl: v.string(),
  },
  returns: v.object({
    linkedSite: linkedSiteValidator,
  }),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const linkedSite = validateLinkedSite({
      githubRepo: args.githubRepo,
      defaultBranch: args.defaultBranch,
      productionUrl: args.productionUrl,
    });

    const duplicate = await ctx.db
      .query("clients")
      .withIndex("by_linkedSite_githubRepo", (q) =>
        q.eq("linkedSite.githubRepo", linkedSite.githubRepo),
      )
      .unique();
    if (duplicate && duplicate._id !== client._id) {
      throw new Error("Ce repo GitHub est déjà lié à un autre client");
    }

    await ctx.db.patch(client._id, { linkedSite });

    await ctx.scheduler.runAfter(0, internal.sitesInternal.bootstrapGit, {
      clientId: client._id,
    });

    return { linkedSite };
  },
});

/** Remove linked-site metadata and cached piloting data (Operator). */
export const clearLinkedSite = operatorMutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    await ctx.db.patch(client._id, { linkedSite: undefined });
    await ctx.runMutation(internal.sitesInternal.deleteSiteData, {
      clientId: client._id,
    });
    return null;
  },
});

/** Issue a new deploy token for CI (Operator). Plain token returned once. */
export const issueDeployToken = action({
  args: { slug: v.string() },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const operator = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });
    if (!operator || operator.role !== "operator") {
      throw new Error("Unauthorized: Operator access required");
    }

    const client = await ctx.runQuery(internal.sitesInternal.getLinkedClientBySlug, {
      slug: args.slug,
    });
    if (!client) {
      throw new Error("Aucun site lié pour ce client");
    }

    const plain = createDeployTokenPlain();
    const tokenHash = await hashDeployToken(plain);
    await ctx.runMutation(internal.sitesInternal.storeDeployToken, {
      clientId: client._id,
      tokenHash,
    });

    return { token: plain };
  },
});

/** Revoke active deploy tokens (Operator). */
export const revokeDeployToken = operatorMutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!hasLinkedSite(client)) {
      throw new Error("Aucun site lié pour ce client");
    }
    await ctx.runMutation(internal.sitesInternal.revokeDeployTokens, {
      clientId: client._id,
    });
    return null;
  },
});

/** Re-fetch git history from GitHub (Operator). */
export const refreshGit = action({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const operator = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });
    if (!operator || operator.role !== "operator") {
      throw new Error("Unauthorized: Operator access required");
    }

    const client = await ctx.runQuery(internal.sitesInternal.getLinkedClientBySlug, {
      slug: args.slug,
    });
    if (!client) {
      throw new Error("Aucun site lié pour ce client");
    }

    await ctx.runAction(internal.sitesInternal.bootstrapGit, {
      clientId: client._id,
    });
    return null;
  },
});
