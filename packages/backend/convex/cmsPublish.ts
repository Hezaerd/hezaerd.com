"use node";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  buildLatestSnapshotKey,
  buildPublishedSnapshotKey,
  buildSnapshotJson,
} from "./lib/cms";
import { putR2Object } from "./lib/r2";

/** Publish draft values to versioned R2 snapshots. */
export const publish = action({
  args: { slug: v.string() },
  returns: v.object({
    version: v.number(),
    publishedAt: v.number(),
    r2Key: v.string(),
  }),
  handler: async (ctx, args): Promise<{ version: number; publishedAt: number; r2Key: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const payload = (await ctx.runQuery(internal.cmsInternal.getPublishPayload, {
      authId: identity.subject,
      slug: args.slug,
    })) as
      | {
          ok: true;
          clientId: string;
          slug: string;
          version: number;
          fields: Record<string, string>;
        }
      | { ok: false; error: string };

    if (!payload.ok) {
      throw new Error(payload.error);
    }

    const publishedAt = Date.now();
    const snapshotBody = buildSnapshotJson({
      version: payload.version,
      publishedAt,
      fields: payload.fields,
    });
    const versionedKey = buildPublishedSnapshotKey(payload.slug, payload.version);
    const latestKey = buildLatestSnapshotKey(payload.slug);

    await putR2Object({
      key: versionedKey,
      body: snapshotBody,
      contentType: "application/json",
      cacheControl: "public, max-age=31536000, immutable",
    });

    await putR2Object({
      key: latestKey,
      body: snapshotBody,
      contentType: "application/json",
      cacheControl: "public, max-age=60",
    });

    return (await ctx.runMutation(internal.cmsInternal.applyPublish, {
      authId: identity.subject,
      slug: args.slug,
      version: payload.version,
      fields: payload.fields,
      r2Key: versionedKey,
      publishedAt,
    })) as { version: number; publishedAt: number; r2Key: string };
  },
});
