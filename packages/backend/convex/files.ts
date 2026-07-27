import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authedMutation, authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import {
  countPendingSlots,
  fileRequestSlotValidator,
  fileRequestValidator,
  formatAllowedExtensions,
  getFileRequestOrThrow,
  getSlotOrThrow,
  isRequestComplete,
  normalizeExtensions,
} from "./lib/files";
import { resolveClientFileSettings } from "./lib/fileSettings";
import { assertClientAccess } from "./lib/users";

const slotInputValidator = v.object({
  label: v.string(),
  allowedExtensions: v.array(v.string()),
});

const requestWithSlotsValidator = v.object({
  request: fileRequestValidator,
  slots: v.array(fileRequestSlotValidator),
  pendingCount: v.number(),
  isComplete: v.boolean(),
});

async function loadRequestsWithSlots(ctx: QueryCtx, clientId: Id<"clients">, status?: "active" | "cancelled") {
  const requests = status
    ? await ctx.db
        .query("fileRequests")
        .withIndex("by_clientId_and_status", (q) =>
          q.eq("clientId", clientId).eq("status", status),
        )
        .collect()
    : await ctx.db
        .query("fileRequests")
        .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
        .collect();

  const sorted = [...requests].sort((a, b) => b._creationTime - a._creationTime);

  return Promise.all(
    sorted.map(async (request) => {
      const slots = await ctx.db
        .query("fileRequestSlots")
        .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
        .collect();
      slots.sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        request,
        slots,
        pendingCount: countPendingSlots(slots),
        isComplete: isRequestComplete(slots),
      };
    }),
  );
}

function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Titre requis");
  }
  return trimmed;
}

function validateReason(reason: string): string {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error("Raison requise");
  }
  return trimmed;
}

function validateSlotsInput(slots: Array<{ label: string; allowedExtensions: string[] }>) {
  if (slots.length === 0) {
    throw new Error("Ajoute au moins un fichier attendu");
  }

  return slots.map((slot, index) => {
    const label = slot.label.trim();
    if (!label) {
      throw new Error(`Slot ${index + 1} : label requis`);
    }
    return {
      label,
      allowedExtensions: normalizeExtensions(slot.allowedExtensions),
    };
  });
}

async function createClientNotification(
  ctx: MutationCtx,
  input: {
    clientId: Id<"clients">;
    kind: "file_request_cancelled" | "file_slot_removed";
    title: string;
    description: string;
  },
) {
  await ctx.db.insert("clientNotifications", {
    clientId: input.clientId,
    kind: input.kind,
    title: input.title,
    description: input.description,
  });
}

/** Operator Desk — all file requests for one Client. */
export const listForDesk = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(requestWithSlotsValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    return loadRequestsWithSlots(ctx, client._id);
  },
});

/** Client Workspace — active file requests. */
export const listForWorkspace = authedQuery({
  args: { slug: v.string() },
  returns: v.array(requestWithSlotsValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    return loadRequestsWithSlots(ctx, client._id, "active");
  },
});

/** Create a file request with checklist slots. */
export const createRequest = operatorMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    instructions: v.optional(v.string()),
    maxFileSizeMb: v.optional(v.number()),
    slots: v.array(slotInputValidator),
  },
  returns: requestWithSlotsValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const settings = resolveClientFileSettings(client);
    const title = validateTitle(args.title);
    const slots = validateSlotsInput(args.slots);
    const maxFileSizeMb = args.maxFileSizeMb ?? settings.defaultMaxFileSizeMb;
    if (!Number.isFinite(maxFileSizeMb) || maxFileSizeMb <= 0) {
      throw new Error("Taille max invalide");
    }

    const instructions = args.instructions?.trim() || undefined;

    const requestId = await ctx.db.insert("fileRequests", {
      clientId: client._id,
      title,
      instructions,
      maxFileSizeMb,
      status: "active",
    });

    for (const [index, slot] of slots.entries()) {
      await ctx.db.insert("fileRequestSlots", {
        requestId,
        clientId: client._id,
        label: slot.label,
        sortOrder: index,
        allowedExtensions: slot.allowedExtensions,
      });
    }

    const created = await loadRequestsWithSlots(ctx, client._id);
    const result = created.find((entry) => entry.request._id === requestId);
    if (!result) {
      throw new Error("Demande introuvable");
    }
    return result;
  },
});

/** Update request metadata (not slots). */
export const updateRequest = operatorMutation({
  args: {
    requestId: v.id("fileRequests"),
    title: v.optional(v.string()),
    instructions: v.optional(v.string()),
    maxFileSizeMb: v.optional(v.number()),
  },
  returns: requestWithSlotsValidator,
  handler: async (ctx, args) => {
    const request = await getFileRequestOrThrow(ctx, args.requestId);
    const client = await ctx.db.get("clients", request.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    await assertClientAccess(ctx, ctx.user, client.slug);

    const patch: Partial<Doc<"fileRequests">> = {};
    if (args.title !== undefined) {
      patch.title = validateTitle(args.title);
    }
    if (args.instructions !== undefined) {
      patch.instructions = args.instructions.trim() || undefined;
    }
    if (args.maxFileSizeMb !== undefined) {
      if (!Number.isFinite(args.maxFileSizeMb) || args.maxFileSizeMb <= 0) {
        throw new Error("Taille max invalide");
      }
      patch.maxFileSizeMb = args.maxFileSizeMb;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.requestId, patch);
    }

    const updated = await loadRequestsWithSlots(ctx, client._id);
    const result = updated.find((entry) => entry.request._id === args.requestId);
    if (!result) {
      throw new Error("Demande introuvable");
    }
    return result;
  },
});

/** Add a slot to an active request. */
export const addSlot = operatorMutation({
  args: {
    requestId: v.id("fileRequests"),
    label: v.string(),
    allowedExtensions: v.array(v.string()),
  },
  returns: requestWithSlotsValidator,
  handler: async (ctx, args) => {
    const request = await getFileRequestOrThrow(ctx, args.requestId);
    if (request.status !== "active") {
      throw new Error("Demande inactive");
    }
    const client = await ctx.db.get("clients", request.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    await assertClientAccess(ctx, ctx.user, client.slug);

    const label = args.label.trim();
    if (!label) {
      throw new Error("Label requis");
    }

    const existing = await ctx.db
      .query("fileRequestSlots")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .collect();

    await ctx.db.insert("fileRequestSlots", {
      requestId: args.requestId,
      clientId: client._id,
      label,
      sortOrder: existing.length,
      allowedExtensions: normalizeExtensions(args.allowedExtensions),
    });

    const updated = await loadRequestsWithSlots(ctx, client._id);
    const result = updated.find((entry) => entry.request._id === args.requestId);
    if (!result) {
      throw new Error("Demande introuvable");
    }
    return result;
  },
});

/** Update slot label/extensions. Requires reason if slot already has a file and extensions change. */
export const updateSlot = operatorMutation({
  args: {
    slotId: v.id("fileRequestSlots"),
    label: v.optional(v.string()),
    allowedExtensions: v.optional(v.array(v.string())),
    reason: v.optional(v.string()),
  },
  returns: requestWithSlotsValidator,
  handler: async (ctx, args) => {
    const slot = await getSlotOrThrow(ctx, args.slotId);
    const request = await getFileRequestOrThrow(ctx, slot.requestId);
    const client = await ctx.db.get("clients", request.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    await assertClientAccess(ctx, ctx.user, client.slug);

    const nextExtensions =
      args.allowedExtensions !== undefined
        ? normalizeExtensions(args.allowedExtensions)
        : slot.allowedExtensions;

    const extensionsChanged =
      args.allowedExtensions !== undefined &&
      JSON.stringify(nextExtensions) !== JSON.stringify(slot.allowedExtensions);

    if (slot.file && extensionsChanged) {
      const reason = validateReason(args.reason ?? "");
      await createClientNotification(ctx, {
        clientId: client._id,
        kind: "file_slot_removed",
        title: `Mise à jour — ${slot.label}`,
        description: reason,
      });
      await ctx.db.patch(args.slotId, {
        label: args.label?.trim() || slot.label,
        allowedExtensions: nextExtensions,
        file: undefined,
      });
    } else {
      const patch: Partial<Doc<"fileRequestSlots">> = {};
      if (args.label !== undefined) {
        const label = args.label.trim();
        if (!label) {
          throw new Error("Label requis");
        }
        patch.label = label;
      }
      if (args.allowedExtensions !== undefined) {
        patch.allowedExtensions = nextExtensions;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(args.slotId, patch);
      }
    }

    const updated = await loadRequestsWithSlots(ctx, client._id);
    const result = updated.find((entry) => entry.request._id === request._id);
    if (!result) {
      throw new Error("Demande introuvable");
    }
    return result;
  },
});

/** Remove a slot — reason required, notifies client. */
export const removeSlot = operatorMutation({
  args: {
    slotId: v.id("fileRequestSlots"),
    reason: v.string(),
  },
  returns: requestWithSlotsValidator,
  handler: async (ctx, args) => {
    const slot = await getSlotOrThrow(ctx, args.slotId);
    const request = await getFileRequestOrThrow(ctx, slot.requestId);
    const client = await ctx.db.get("clients", request.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    await assertClientAccess(ctx, ctx.user, client.slug);

    const reason = validateReason(args.reason);

    await createClientNotification(ctx, {
      clientId: client._id,
      kind: "file_slot_removed",
      title: `Slot retiré — ${slot.label}`,
      description: reason,
    });

    await ctx.db.delete(args.slotId);

    const updated = await loadRequestsWithSlots(ctx, client._id);
    const result = updated.find((entry) => entry.request._id === request._id);
    if (!result) {
      throw new Error("Demande introuvable");
    }
    return result;
  },
});

/** Cancel an entire request — reason required. */
export const cancelRequest = operatorMutation({
  args: {
    requestId: v.id("fileRequests"),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await getFileRequestOrThrow(ctx, args.requestId);
    const client = await ctx.db.get("clients", request.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    await assertClientAccess(ctx, ctx.user, client.slug);

    const reason = validateReason(args.reason);

    await ctx.db.patch(args.requestId, {
      status: "cancelled",
      cancelledReason: reason,
      cancelledAt: Date.now(),
    });

    await createClientNotification(ctx, {
      clientId: client._id,
      kind: "file_request_cancelled",
      title: `Demande annulée — ${request.title}`,
      description: reason,
    });

    return null;
  },
});

/** Dismiss a one-shot client notification. */
export const dismissNotification = authedMutation({
  args: { notificationId: v.id("clientNotifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get("clientNotifications", args.notificationId);
    if (!notification) {
      return null;
    }

    if (ctx.user.role !== "client" || ctx.user.clientId !== notification.clientId) {
      throw new Error("Accès refusé");
    }

    await ctx.db.patch(args.notificationId, { dismissedAt: Date.now() });
    return null;
  },
});

/** Single file request with slots. */
export const getRequest = authedQuery({
  args: {
    slug: v.string(),
    requestId: v.id("fileRequests"),
  },
  returns: v.union(requestWithSlotsValidator, v.null()),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const request = await getFileRequestOrThrow(ctx, args.requestId);
    if (request.clientId !== client._id) {
      return null;
    }

    const slots = await ctx.db
      .query("fileRequestSlots")
      .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
      .collect();
    slots.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      request,
      slots,
      pendingCount: countPendingSlots(slots),
      isComplete: isRequestComplete(slots),
    };
  },
});

/** Needs Attention rows from open file requests. */
export const listNeedsAttention = authedQuery({
  args: { slug: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      clientId: v.string(),
      area: v.literal("files"),
      kind: v.union(v.literal("file"), v.literal("notification")),
    }),
  ),
  handler: async (ctx, args) => {
    if (ctx.user.role !== "client") {
      return [];
    }

    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const requests = await loadRequestsWithSlots(ctx, client._id, "active");
    const fileItems = requests
      .filter((entry) => entry.pendingCount > 0)
      .map((entry) => ({
        id: entry.request._id,
        title: entry.request.title,
        description:
          entry.pendingCount === 1
            ? "1 fichier attendu"
            : `${entry.pendingCount} fichiers attendus`,
        clientId: client.slug,
        area: "files" as const,
        kind: "file" as const,
      }));

    const notifications = await ctx.db
      .query("clientNotifications")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();

    const notificationItems = notifications
      .filter((notification) => !notification.dismissedAt)
      .map((notification) => ({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        clientId: client.slug,
        area: "files" as const,
        kind: "notification" as const,
      }));

    return [...fileItems, ...notificationItems];
  },
});

/** Waiting on Client queue rows for Client Desk. */
export const listWaitingOnClient = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      href: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const requests = await loadRequestsWithSlots(ctx, client._id, "active");

    return requests
      .filter((entry) => entry.pendingCount > 0)
      .map((entry) => ({
        id: entry.request._id,
        title: entry.request.title,
        description:
          entry.pendingCount === 1
            ? "1 fichier en attente"
            : `${entry.pendingCount} fichiers en attente`,
        href: `/op/clients/${client.slug}/files/${entry.request._id}`,
      }));
  },
});