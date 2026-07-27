import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

import { resolveClientFileSettings } from "./fileSettings";

type DbCtx = QueryCtx | MutationCtx;

export function normalizeExtension(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/^\./, "");
  if (!trimmed || !/^[a-z0-9]+$/.test(trimmed)) {
    throw new Error("Extension invalide");
  }
  return trimmed;
}

export function normalizeExtensions(extensions: string[]): string[] {
  const unique = new Set<string>();
  for (const extension of extensions) {
    if (extension === "*") {
      return [];
    }
    unique.add(normalizeExtension(extension));
  }
  return [...unique];
}

export function extensionFromFileName(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}

export function isExtensionAllowed(fileName: string, allowedExtensions: string[]): boolean {
  if (allowedExtensions.length === 0) {
    return true;
  }
  const extension = extensionFromFileName(fileName);
  return extension.length > 0 && allowedExtensions.includes(extension);
}

export function formatAllowedExtensions(allowedExtensions: string[]): string {
  if (allowedExtensions.length === 0) {
    return "Tous fichiers";
  }
  return allowedExtensions.map((extension) => `.${extension}`).join(", ");
}

export function buildR2ObjectKey(input: {
  slug: string;
  requestId: Id<"fileRequests">;
  slotId: Id<"fileRequestSlots">;
}): string {
  return `clients/${input.slug}/requests/${input.requestId}/${input.slotId}`;
}

export async function getFileRequestOrThrow(
  ctx: DbCtx,
  requestId: Id<"fileRequests">,
): Promise<Doc<"fileRequests">> {
  const request = await ctx.db.get("fileRequests", requestId);
  if (!request) {
    throw new Error("Demande introuvable");
  }
  return request;
}

export async function getSlotOrThrow(
  ctx: DbCtx,
  slotId: Id<"fileRequestSlots">,
): Promise<Doc<"fileRequestSlots">> {
  const slot = await ctx.db.get("fileRequestSlots", slotId);
  if (!slot) {
    throw new Error("Slot introuvable");
  }
  return slot;
}

export function countPendingSlots(slots: Doc<"fileRequestSlots">[]): number {
  return slots.filter((slot) => !slot.file).length;
}

export function isRequestComplete(slots: Doc<"fileRequestSlots">[]): boolean {
  return slots.length > 0 && slots.every((slot) => slot.file);
}

export function resolveMaxFileSizeBytes(client: Doc<"clients">, requestMaxFileSizeMb: number): number {
  if (!Number.isFinite(requestMaxFileSizeMb) || requestMaxFileSizeMb <= 0) {
    throw new Error("Taille max invalide");
  }
  resolveClientFileSettings(client);
  return Math.floor(requestMaxFileSizeMb * 1024 * 1024);
}

export const slotFileValidator = v.object({
  r2Key: v.string(),
  fileName: v.string(),
  contentType: v.string(),
  sizeBytes: v.number(),
  uploadedAt: v.number(),
  replacedAt: v.optional(v.number()),
  previousFileName: v.optional(v.string()),
});

export const fileRequestSlotValidator = v.object({
  _id: v.id("fileRequestSlots"),
  _creationTime: v.number(),
  requestId: v.id("fileRequests"),
  clientId: v.id("clients"),
  label: v.string(),
  sortOrder: v.number(),
  allowedExtensions: v.array(v.string()),
  file: v.optional(slotFileValidator),
});

export const fileRequestValidator = v.object({
  _id: v.id("fileRequests"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  title: v.string(),
  instructions: v.optional(v.string()),
  maxFileSizeMb: v.number(),
  status: v.union(v.literal("active"), v.literal("cancelled")),
  cancelledReason: v.optional(v.string()),
  cancelledAt: v.optional(v.number()),
});
