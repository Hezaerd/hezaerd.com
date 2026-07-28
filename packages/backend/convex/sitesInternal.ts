import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { hashDeployToken } from "./lib/deployToken";
import { fetchRecentCommits } from "./lib/githubApp";
import { evaluateHealthCheck, hasLinkedSite, shortSha } from "./lib/sites";

const gitValidator = v.object({
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
});

export const listLinkedClients = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("clients"),
      linkedSite: v.object({
        githubRepo: v.string(),
        defaultBranch: v.string(),
        productionUrl: v.string(),
      }),
    }),
  ),
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    return clients
      .filter(hasLinkedSite)
      .map((client) => ({
        _id: client._id,
        linkedSite: client.linkedSite!,
      }));
  },
});

export const getSnapshotByClientId = internalQuery({
  args: { clientId: v.id("clients") },
  returns: v.union(
    v.object({
      _id: v.id("siteSnapshots"),
      health: v.object({
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
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const snapshot = await ctx.db
      .query("siteSnapshots")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();
    if (!snapshot) {
      return null;
    }
    return {
      _id: snapshot._id,
      health: snapshot.health,
    };
  },
});

export const getClientByGithubRepo = internalQuery({
  args: { githubRepo: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("clients"),
      linkedSite: v.object({
        githubRepo: v.string(),
        defaultBranch: v.string(),
        productionUrl: v.string(),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query("clients")
      .withIndex("by_linkedSite_githubRepo", (q) =>
        q.eq("linkedSite.githubRepo", args.githubRepo),
      )
      .unique();
    if (!client || !hasLinkedSite(client)) {
      return null;
    }
    return {
      _id: client._id,
      linkedSite: client.linkedSite!,
    };
  },
});

export const getClientByDeployTokenHash = internalQuery({
  args: { tokenHash: v.string() },
  returns: v.union(v.id("clients"), v.null()),
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query("siteDeployTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();
    if (!token || token.revokedAt) {
      return null;
    }
    return token.clientId;
  },
});

async function upsertSnapshot(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  patch: {
    health?: Doc<"siteSnapshots">["health"];
    git?: Doc<"siteSnapshots">["git"];
    deploy?: Doc<"siteSnapshots">["deploy"];
  },
) {
  const existing = await ctx.db
    .query("siteSnapshots")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return existing._id;
  }

  return await ctx.db.insert("siteSnapshots", {
    clientId,
    health: patch.health ?? {
      status: "unknown",
      checkedAt: Date.now(),
      consecutiveFailures: 0,
    },
    git: patch.git,
    deploy: patch.deploy,
  });
}

export const setGitSnapshot = internalMutation({
  args: {
    clientId: v.id("clients"),
    git: gitValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsertSnapshot(ctx, args.clientId, { git: args.git });
    return null;
  },
});

export const setDeploySnapshot = internalMutation({
  args: {
    clientId: v.id("clients"),
    deploy: v.object({
      status: v.union(v.literal("success"), v.literal("failure"), v.literal("in_progress")),
      commitSha: v.optional(v.string()),
      previewUrl: v.optional(v.string()),
      finishedAt: v.number(),
      reportedAt: v.number(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsertSnapshot(ctx, args.clientId, { deploy: args.deploy });
    return null;
  },
});

export const setHealthSnapshot = internalMutation({
  args: {
    clientId: v.id("clients"),
    health: v.object({
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
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await upsertSnapshot(ctx, args.clientId, { health: args.health });
    return null;
  },
});

export const storeDeployToken = internalMutation({
  args: {
    clientId: v.id("clients"),
    tokenHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteDeployTokens")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();

    for (const token of existing) {
      if (!token.revokedAt) {
        await ctx.db.patch(token._id, { revokedAt: Date.now() });
      }
    }

    await ctx.db.insert("siteDeployTokens", {
      clientId: args.clientId,
      tokenHash: args.tokenHash,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const revokeDeployTokens = internalMutation({
  args: { clientId: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("siteDeployTokens")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    for (const token of tokens) {
      if (!token.revokedAt) {
        await ctx.db.patch(token._id, { revokedAt: Date.now() });
      }
    }
    return null;
  },
});

export const deleteSiteData = internalMutation({
  args: { clientId: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const snapshot = await ctx.db
      .query("siteSnapshots")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();
    if (snapshot) {
      await ctx.db.delete(snapshot._id);
    }

    const tokens = await ctx.db
      .query("siteDeployTokens")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }
    return null;
  },
});

export const getLinkedClientBySlug = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("clients"),
      linkedSite: v.object({
        githubRepo: v.string(),
        defaultBranch: v.string(),
        productionUrl: v.string(),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const client = await ctx.db
      .query("clients")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!client || !hasLinkedSite(client)) {
      return null;
    }
    return {
      _id: client._id,
      linkedSite: client.linkedSite!,
    };
  },
});

export const bootstrapGit = internalAction({
  args: { clientId: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await ctx.runQuery(internal.sitesInternal.getLinkedClientById, {
      clientId: args.clientId,
    });
    if (!client) {
      return null;
    }

    try {
      const commits = await fetchRecentCommits({
        githubRepo: client.linkedSite.githubRepo,
        branch: client.linkedSite.defaultBranch,
      });
      await ctx.runMutation(internal.sitesInternal.setGitSnapshot, {
        clientId: args.clientId,
        git: {
          branch: client.linkedSite.defaultBranch,
          commits,
          syncedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("site git bootstrap failed", args.clientId, error);
    }
    return null;
  },
});

export const getLinkedClientById = internalQuery({
  args: { clientId: v.id("clients") },
  returns: v.union(
    v.object({
      _id: v.id("clients"),
      linkedSite: v.object({
        githubRepo: v.string(),
        defaultBranch: v.string(),
        productionUrl: v.string(),
      }),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const client = await ctx.db.get("clients", args.clientId);
    if (!client || !hasLinkedSite(client)) {
      return null;
    }
    return {
      _id: client._id,
      linkedSite: client.linkedSite!,
    };
  },
});

export const syncGitFromPush = internalAction({
  args: {
    githubRepo: v.string(),
    branch: v.string(),
    forced: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await ctx.runQuery(internal.sitesInternal.getClientByGithubRepo, {
      githubRepo: args.githubRepo,
    });
    if (!client || client.linkedSite.defaultBranch !== args.branch) {
      return null;
    }

    try {
      const commits = await fetchRecentCommits({
        githubRepo: args.githubRepo,
        branch: args.branch,
      });
      await ctx.runMutation(internal.sitesInternal.setGitSnapshot, {
        clientId: client._id,
        git: {
          branch: args.branch,
          commits,
          syncedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("site git sync failed", args.githubRepo, error);
    }
    return null;
  },
});

export const runHealthChecks = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const clients = await ctx.runQuery(internal.sitesInternal.listLinkedClients, {});

    for (const client of clients) {
      const previous = await ctx.runQuery(internal.sitesInternal.getSnapshotByClientId, {
        clientId: client._id,
      });

      const started = Date.now();
      let ok = false;
      let httpStatus: number | undefined;
      let latencyMs = 0;

      try {
        const response = await fetch(client.linkedSite.productionUrl, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
        });
        httpStatus = response.status;
        latencyMs = Date.now() - started;
        ok = response.status >= 200 && response.status < 400;
      } catch {
        latencyMs = Date.now() - started;
        ok = false;
      }

      const evaluated = evaluateHealthCheck({
        previousStatus: previous?.health.status ?? "unknown",
        consecutiveFailures: previous?.health.consecutiveFailures ?? 0,
        ok,
        latencyMs,
        httpStatus,
      });

      await ctx.runMutation(internal.sitesInternal.setHealthSnapshot, {
        clientId: client._id,
        health: {
          status: evaluated.status,
          latencyMs,
          httpStatus,
          checkedAt: Date.now(),
          consecutiveFailures: evaluated.consecutiveFailures,
        },
      });
    }

    return null;
  },
});

export const mapPushCommits = internalMutation({
  args: {
    clientId: v.id("clients"),
    branch: v.string(),
    commits: v.array(
      v.object({
        id: v.string(),
        message: v.string(),
        authorName: v.string(),
        timestamp: v.number(),
        url: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mapped = args.commits.slice(0, 5).map((commit) => ({
      sha: commit.id,
      shortSha: shortSha(commit.id),
      message: commit.message.split("\n")[0] ?? commit.message,
      author: commit.authorName,
      committedAt: commit.timestamp,
      url: commit.url,
    }));

    await upsertSnapshot(ctx, args.clientId, {
      git: {
        branch: args.branch,
        commits: mapped,
        syncedAt: Date.now(),
      },
    });
    return null;
  },
});
