"use node";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  createDownloadPresignedUrl,
  createPreviewPresignedUrl,
  createUploadPresignedUrl,
  deleteR2Object,
  headR2Object,
} from "./lib/r2";

type UploadAccess = {
  r2Key: string;
  existingR2Key?: string;
  uploadPresignTtlHours: number;
  maxFileSizeBytes: number;
};

type SlotFileMeta = {
  r2Key: string;
  fileName: string;
  contentType: string;
  downloadPresignTtlMinutes: number;
};

export const prepareUpload = action({
  args: {
    slotId: v.id("fileRequestSlots"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.object({
    uploadUrl: v.string(),
    r2Key: v.string(),
  }),
  handler: async (ctx, args): Promise<{ uploadUrl: string; r2Key: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const validation = await ctx.runQuery(internal.filesInternal.validateUploadIntent, {
      authId: identity.subject,
      slotId: args.slotId,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
    });

    if (!validation.ok || !validation.access) {
      throw new Error(validation.error ?? "Upload refusé");
    }

    const access = validation.access as UploadAccess;

    if (access.existingR2Key) {
      try {
        await deleteR2Object(access.existingR2Key);
      } catch {
        // Best effort — metadata updates on complete.
      }
    }

    const uploadUrl = await createUploadPresignedUrl({
      key: access.r2Key,
      contentType: args.contentType,
      maxSizeBytes: args.sizeBytes,
      expiresInSeconds: access.uploadPresignTtlHours * 60 * 60,
    });

    return { uploadUrl, r2Key: access.r2Key };
  },
});

export const completeUpload = action({
  args: {
    slotId: v.id("fileRequestSlots"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const validation = await ctx.runQuery(internal.filesInternal.validateUploadIntent, {
      authId: identity.subject,
      slotId: args.slotId,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
    });

    if (!validation.ok || !validation.access) {
      throw new Error(validation.error ?? "Upload refusé");
    }

    const access = validation.access as UploadAccess;
    const head = await headR2Object(access.r2Key);
    if (head.contentLength <= 0) {
      throw new Error("Fichier introuvable sur le stockage");
    }
    if (head.contentLength > access.maxFileSizeBytes) {
      await deleteR2Object(access.r2Key);
      throw new Error("Fichier trop lourd");
    }

    await ctx.runMutation(internal.filesInternal.applyUpload, {
      slotId: args.slotId,
      authId: identity.subject,
      fileName: args.fileName,
      contentType: args.contentType,
      sizeBytes: head.contentLength,
      r2Key: access.r2Key,
    });

    return null;
  },
});

export const getDownloadUrl = action({
  args: {
    slotId: v.id("fileRequestSlots"),
  },
  returns: v.object({
    url: v.string(),
    fileName: v.string(),
    contentType: v.string(),
  }),
  handler: async (ctx, args): Promise<{ url: string; fileName: string; contentType: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const slotMeta = (await ctx.runQuery(internal.filesInternal.getSlotFileMeta, {
      authId: identity.subject,
      slotId: args.slotId,
    })) as SlotFileMeta | null;

    if (!slotMeta) {
      throw new Error("Fichier introuvable");
    }

    const url = await createDownloadPresignedUrl({
      key: slotMeta.r2Key,
      expiresInSeconds: slotMeta.downloadPresignTtlMinutes * 60,
      fileName: slotMeta.fileName,
    });

    return {
      url,
      fileName: slotMeta.fileName,
      contentType: slotMeta.contentType,
    };
  },
});

export const getPreviewUrl = action({
  args: {
    slotId: v.id("fileRequestSlots"),
  },
  returns: v.object({
    url: v.string(),
    fileName: v.string(),
    contentType: v.string(),
    previewKind: v.union(v.literal("image"), v.literal("pdf"), v.literal("video"), v.literal("none")),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    url: string;
    fileName: string;
    contentType: string;
    previewKind: "image" | "pdf" | "video" | "none";
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const slotMeta = (await ctx.runQuery(internal.filesInternal.getSlotFileMeta, {
      authId: identity.subject,
      slotId: args.slotId,
    })) as SlotFileMeta | null;

    if (!slotMeta) {
      throw new Error("Fichier introuvable");
    }

    const previewKind = resolvePreviewKind(slotMeta.contentType, slotMeta.fileName);
    if (previewKind === "none") {
      return {
        url: "",
        fileName: slotMeta.fileName,
        contentType: slotMeta.contentType,
        previewKind,
      };
    }

    const url = await createPreviewPresignedUrl({
      key: slotMeta.r2Key,
      expiresInSeconds: slotMeta.downloadPresignTtlMinutes * 60,
      contentType: slotMeta.contentType,
    });

    return {
      url,
      fileName: slotMeta.fileName,
      contentType: slotMeta.contentType,
      previewKind,
    };
  },
});

function resolvePreviewKind(
  contentType: string,
  fileName: string,
): "image" | "pdf" | "video" | "none" {
  const lowerType = contentType.toLowerCase();
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (lowerType.startsWith("image/") || extension === "svg") {
    return "image";
  }
  if (lowerType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }
  if (lowerType.startsWith("video/")) {
    return "video";
  }
  return "none";
}
