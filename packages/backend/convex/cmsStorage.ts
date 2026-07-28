"use node";

import { randomUUID } from "node:crypto";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { createUploadPresignedUrl, headR2Object } from "./lib/r2";

type ImageUploadAccess = {
  r2Key: string;
  publicUrl: string;
  maxSizeBytes: number;
  uploadPresignTtlHours: number;
};

export const prepareImageUpload = action({
  args: {
    slug: v.string(),
    fieldKey: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    assetId: v.string(),
  }),
  handler: async (ctx, args): Promise<{ uploadUrl: string; assetId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const assetId = randomUUID();
    const validation = await ctx.runQuery(internal.cmsInternal.validateImageUploadIntent, {
      authId: identity.subject,
      slug: args.slug,
      fieldKey: args.fieldKey,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      assetId,
    });

    if (!validation.ok || !validation.access) {
      throw new Error(validation.error ?? "Upload refusé");
    }

    const access = validation.access as ImageUploadAccess;
    const uploadUrl = await createUploadPresignedUrl({
      key: access.r2Key,
      contentType: args.contentType,
      maxSizeBytes: args.sizeBytes,
      expiresInSeconds: access.uploadPresignTtlHours * 60 * 60,
    });

    return { uploadUrl, assetId };
  },
});

export const completeImageUpload = action({
  args: {
    slug: v.string(),
    fieldKey: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    assetId: v.string(),
  },
  returns: v.object({ publicUrl: v.string() }),
  handler: async (ctx, args): Promise<{ publicUrl: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const validation = await ctx.runQuery(internal.cmsInternal.validateImageUploadIntent, {
      authId: identity.subject,
      slug: args.slug,
      fieldKey: args.fieldKey,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      assetId: args.assetId,
    });

    if (!validation.ok || !validation.access) {
      throw new Error(validation.error ?? "Upload refusé");
    }

    const access = validation.access as ImageUploadAccess;
    const head = await headR2Object(access.r2Key);
    if (head.contentLength <= 0) {
      throw new Error("Image introuvable sur le stockage");
    }
    if (head.contentLength > access.maxSizeBytes) {
      throw new Error("Image trop lourde");
    }

    await ctx.runMutation(internal.cmsInternal.applyImageUpload, {
      authId: identity.subject,
      slug: args.slug,
      fieldKey: args.fieldKey,
      publicUrl: access.publicUrl,
    });

    return { publicUrl: access.publicUrl };
  },
});
