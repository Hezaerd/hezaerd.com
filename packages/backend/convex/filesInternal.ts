import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery } from "./_generated/server";
import {
  buildR2ObjectKey,
  getFileRequestOrThrow,
  getSlotOrThrow,
  isExtensionAllowed,
  resolveMaxFileSizeBytes,
} from "./lib/files";
import { resolveClientFileSettings } from "./lib/fileSettings";
import { assertClientAccess } from "./lib/users";

const slotAccessValidator = v.object({
  slotId: v.id("fileRequestSlots"),
  requestId: v.id("fileRequests"),
  clientId: v.id("clients"),
  clientSlug: v.string(),
  requestStatus: v.union(v.literal("active"), v.literal("cancelled")),
  maxFileSizeMb: v.number(),
  maxFileSizeBytes: v.number(),
  uploadPresignTtlHours: v.number(),
  downloadPresignTtlMinutes: v.number(),
  allowedExtensions: v.array(v.string()),
  r2Key: v.string(),
  existingR2Key: v.optional(v.string()),
  role: v.union(v.literal("operator"), v.literal("client")),
});

async function loadSlotAccess(ctx: QueryCtx, args: { authId: string; slotId: Id<"fileRequestSlots"> }) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", args.authId))
    .unique();
  if (!user) {
    return null;
  }

  const slot = await getSlotOrThrow(ctx, args.slotId);
  const request = await getFileRequestOrThrow(ctx, slot.requestId);
  const client = await ctx.db.get("clients", request.clientId);
  if (!client) {
    return null;
  }

  try {
    await assertClientAccess(ctx, user, client.slug);
  } catch {
    return null;
  }

  const settings = resolveClientFileSettings(client);

  return {
    slotId: slot._id,
    requestId: request._id,
    clientId: client._id,
    clientSlug: client.slug,
    requestStatus: request.status,
    maxFileSizeMb: request.maxFileSizeMb,
    maxFileSizeBytes: resolveMaxFileSizeBytes(client, request.maxFileSizeMb),
    uploadPresignTtlHours: settings.uploadPresignTtlHours,
    downloadPresignTtlMinutes: settings.downloadPresignTtlMinutes,
    allowedExtensions: slot.allowedExtensions,
    r2Key: buildR2ObjectKey({
      slug: client.slug,
      requestId: request._id,
      slotId: slot._id,
    }),
    existingR2Key: slot.file?.r2Key,
    role: user.role,
  };
}

/** Auth + slot metadata for R2 actions. */
export const getSlotAccessForAction = internalQuery({
  args: {
    authId: v.string(),
    slotId: v.id("fileRequestSlots"),
  },
  returns: v.union(slotAccessValidator, v.null()),
  handler: async (ctx, args) => loadSlotAccess(ctx, args),
});

/** Validate upload intent before presigning. */
export const validateUploadIntent = internalQuery({
  args: {
    authId: v.string(),
    slotId: v.id("fileRequestSlots"),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.object({
    ok: v.boolean(),
    error: v.optional(v.string()),
    access: v.optional(slotAccessValidator),
  }),
  handler: async (ctx, args) => {
    const access = await loadSlotAccess(ctx, {
      authId: args.authId,
      slotId: args.slotId,
    });

    if (!access) {
      return { ok: false, error: "Accès refusé" };
    }

    if (access.role !== "client") {
      return { ok: false, error: "Seul le client peut envoyer un fichier" };
    }

    if (access.requestStatus !== "active") {
      return { ok: false, error: "Demande inactive" };
    }

    if (!isExtensionAllowed(args.fileName, access.allowedExtensions)) {
      return { ok: false, error: "Type de fichier non accepté pour ce slot" };
    }

    if (!Number.isFinite(args.sizeBytes) || args.sizeBytes <= 0) {
      return { ok: false, error: "Fichier invalide" };
    }

    if (args.sizeBytes > access.maxFileSizeBytes) {
      return { ok: false, error: "Fichier trop lourd pour cette demande" };
    }

    return { ok: true, access };
  },
});

/** Slot file metadata for download/preview actions. */
export const getSlotFileMeta = internalQuery({
  args: {
    authId: v.string(),
    slotId: v.id("fileRequestSlots"),
  },
  returns: v.union(
    v.object({
      r2Key: v.string(),
      fileName: v.string(),
      contentType: v.string(),
      downloadPresignTtlMinutes: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const access = await loadSlotAccess(ctx, args);
    if (!access) {
      return null;
    }

    const slot = await getSlotOrThrow(ctx, args.slotId);
    if (!slot.file) {
      return null;
    }

    return {
      r2Key: slot.file.r2Key,
      fileName: slot.file.fileName,
      contentType: slot.file.contentType,
      downloadPresignTtlMinutes: access.downloadPresignTtlMinutes,
    };
  },
});

/** Persist uploaded file metadata after R2 PUT succeeds. */
export const applyUpload = internalMutation({
  args: {
    slotId: v.id("fileRequestSlots"),
    authId: v.string(),
    fileName: v.string(),
    contentType: v.string(),
    sizeBytes: v.number(),
    r2Key: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();
    if (!user || user.role !== "client") {
      throw new Error("Seul le client peut envoyer un fichier");
    }

    const slot = await getSlotOrThrow(ctx, args.slotId);
    const request = await getFileRequestOrThrow(ctx, slot.requestId);
    if (request.status !== "active") {
      throw new Error("Demande inactive");
    }

    const client = await ctx.db.get("clients", request.clientId);
    if (!client || user.clientId !== client._id) {
      throw new Error("Accès refusé");
    }

    const now = Date.now();
    const previous = slot.file;

    await ctx.db.patch(args.slotId, {
      file: {
        r2Key: args.r2Key,
        fileName: args.fileName.trim(),
        contentType: args.contentType,
        sizeBytes: args.sizeBytes,
        uploadedAt: now,
        replacedAt: previous ? now : undefined,
        previousFileName: previous?.fileName,
      },
    });

    return null;
  },
});
