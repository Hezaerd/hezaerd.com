import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";

async function probeUrl(url: string, method: "HEAD" | "GET"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
}

/** HTTP reachability for a linked site URL (Operator). */
export const checkHealth = action({
  args: { slug: v.string(), url: v.string() },
  returns: v.object({
    ok: v.boolean(),
    statusCode: v.optional(v.number()),
    latencyMs: v.number(),
  }),
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

    const client = await ctx.runQuery(internal.clients.getForInviteInternal, {
      slug: args.slug,
    });
    if (!client) {
      throw new Error("Client not found");
    }

    const start = Date.now();
    try {
      let response = await probeUrl(args.url, "HEAD");
      if (response.status === 405 || response.status === 501) {
        response = await probeUrl(args.url, "GET");
      }

      return {
        ok: response.ok,
        statusCode: response.status,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        ok: false,
        latencyMs: Date.now() - start,
      };
    }
  },
});
