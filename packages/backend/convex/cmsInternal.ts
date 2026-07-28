import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery } from "./_generated/server";
import {
  buildSnapshotFields,
  cmsFieldInputValidator,
  hashDeployToken,
  validateFieldInput,
} from "./lib/cms";
import { getClientBySlug } from "./lib/clients";

async function loadSchemasForClient(ctx: QueryCtx, clientId: Id<"clients">) {
  const schemas = await ctx.db
    .query("cmsFieldSchemas")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();
  schemas.sort((a, b) => a.fieldKey.localeCompare(b.fieldKey));
  return schemas;
}

async function loadValuesForClient(ctx: QueryCtx, clientId: Id<"clients">) {
  return await ctx.db
    .query("cmsFieldValues")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();
}

async function getPublishState(ctx: QueryCtx, clientId: Id<"clients">) {
  return await ctx.db
    .query("cmsPublishState")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();
}

export const resolveDeployToken = internalQuery({
  args: {
    tokenPlaintext: v.string(),
    slug: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    error: v.optional(v.string()),
    status: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      return { ok: false, error: "Client introuvable", status: 404 };
    }

    let tokenHash: string;
    try {
      tokenHash = await hashDeployToken(args.tokenPlaintext);
    } catch {
      return { ok: false, error: "Configuration serveur invalide", status: 500 };
    }

    const tokenRow = await ctx.db
      .query("cmsDeployTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!tokenRow) {
      return { ok: false, error: "Token deploy invalide", status: 401 };
    }

    if (tokenRow.revokedAt !== undefined) {
      return { ok: false, error: "Token deploy révoqué", status: 401 };
    }

    if (tokenRow.clientId !== client._id) {
      return { ok: false, error: "Token deploy non autorisé pour ce client", status: 403 };
    }

    return { ok: true };
  },
});

export const registerSchema = internalMutation({
  args: {
    slug: v.string(),
    fields: v.array(cmsFieldInputValidator),
  },
  returns: v.object({
    registered: v.number(),
    deprecated: v.number(),
  }),
  handler: async (ctx, args) => {
    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      throw new Error("Client introuvable");
    }

    const payloadKeys = new Set<string>();
    let registered = 0;

    for (const field of args.fields) {
      const validated = validateFieldInput(field);
      payloadKeys.add(validated.fieldKey);

      const existing = await ctx.db
        .query("cmsFieldSchemas")
        .withIndex("by_clientId_and_fieldKey", (q) =>
          q.eq("clientId", client._id).eq("fieldKey", validated.fieldKey),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          type: validated.type,
          constraints: validated.constraints,
          deprecated: undefined,
        });
      } else {
        await ctx.db.insert("cmsFieldSchemas", {
          clientId: client._id,
          fieldKey: validated.fieldKey,
          type: validated.type,
          constraints: validated.constraints,
        });
      }
      registered += 1;
    }

    const existingSchemas = await loadSchemasForClient(ctx, client._id);
    let deprecated = 0;

    for (const schema of existingSchemas) {
      if (payloadKeys.has(schema.fieldKey) || schema.deprecated) {
        continue;
      }
      await ctx.db.patch(schema._id, { deprecated: true });
      deprecated += 1;
    }

    return { registered, deprecated };
  },
});

export const getPublishPayload = internalQuery({
  args: {
    authId: v.string(),
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      ok: v.literal(true),
      clientId: v.id("clients"),
      slug: v.string(),
      version: v.number(),
      fields: v.record(v.string(), v.string()),
    }),
    v.object({
      ok: v.literal(false),
      error: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();
    if (!user) {
      return { ok: false as const, error: "Utilisateur introuvable" };
    }

    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      return { ok: false as const, error: "Client introuvable" };
    }

    if (user.role !== "client" || user.clientId !== client._id) {
      return { ok: false as const, error: "Accès refusé" };
    }

    if (!client.features.cms) {
      return { ok: false as const, error: "CMS non activé" };
    }

    const schemas = await loadSchemasForClient(ctx, client._id);
    const activeSchemas = schemas.filter((schema) => !schema.deprecated);
    if (activeSchemas.length === 0) {
      return { ok: false as const, error: "Aucun champ CMS enregistré" };
    }

    const values = await loadValuesForClient(ctx, client._id);

    let fields: Record<string, string>;
    try {
      fields = buildSnapshotFields(activeSchemas, values);
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "Snapshot invalide",
      };
    }

    const publishState = await getPublishState(ctx, client._id);
    const version = (publishState?.version ?? 0) + 1;

    return {
      ok: true as const,
      clientId: client._id,
      slug: client.slug,
      version,
      fields,
    };
  },
});

export const applyPublish = internalMutation({
  args: {
    authId: v.string(),
    slug: v.string(),
    version: v.number(),
    fields: v.record(v.string(), v.string()),
    r2Key: v.string(),
    publishedAt: v.number(),
  },
  returns: v.object({
    version: v.number(),
    publishedAt: v.number(),
    r2Key: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .unique();
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      throw new Error("Client introuvable");
    }

    if (user.role !== "client" || user.clientId !== client._id) {
      throw new Error("Accès refusé");
    }

    if (!client.features.cms) {
      throw new Error("CMS non activé");
    }

    const publishState = await getPublishState(ctx, client._id);
    const expectedVersion = (publishState?.version ?? 0) + 1;
    if (args.version !== expectedVersion) {
      throw new Error("Version publish obsolète");
    }

    if (publishState) {
      await ctx.db.patch(publishState._id, {
        version: args.version,
        publishedAt: args.publishedAt,
        r2Key: args.r2Key,
        publishedFields: args.fields,
      });
    } else {
      await ctx.db.insert("cmsPublishState", {
        clientId: client._id,
        version: args.version,
        publishedAt: args.publishedAt,
        r2Key: args.r2Key,
        publishedFields: args.fields,
      });
    }

    return {
      version: args.version,
      publishedAt: args.publishedAt,
      r2Key: args.r2Key,
    };
  },
});

export async function loadDeskFieldRows(
  ctx: QueryCtx,
  clientId: Id<"clients">,
): Promise<
  Array<{
    schema: Doc<"cmsFieldSchemas">;
    draftValue: string | null;
    publishedValue: string | null;
  }>
> {
  const schemas = await loadSchemasForClient(ctx, clientId);
  const values = await loadValuesForClient(ctx, clientId);
  const valueByKey = new Map(values.map((entry) => [entry.fieldKey, entry.draftValue]));
  const publishState = await getPublishState(ctx, clientId);
  const publishedFields = publishState?.publishedFields ?? {};

  return schemas.map((schema) => ({
    schema,
    draftValue: valueByKey.get(schema.fieldKey) ?? null,
    publishedValue: publishedFields[schema.fieldKey] ?? null,
  }));
}

export async function loadWorkspaceFields(
  ctx: QueryCtx,
  clientId: Id<"clients">,
): Promise<{
  fields: Array<{
    schema: Doc<"cmsFieldSchemas">;
    draftValue: string | null;
  }>;
  hasUnpublishedChanges: boolean;
}> {
  const schemas = (await loadSchemasForClient(ctx, clientId)).filter(
    (schema) => !schema.deprecated,
  );
  const values = await loadValuesForClient(ctx, clientId);
  const valueByKey = new Map(values.map((entry) => [entry.fieldKey, entry.draftValue]));
  const publishState = await getPublishState(ctx, clientId);

  const draftSnapshot = buildSnapshotFields(schemas, values);
  const publishedFields = publishState?.publishedFields ?? {};
  const hasUnpublishedChanges =
    publishState?.version === undefined || publishState.version === 0
      ? Object.keys(draftSnapshot).length > 0
      : !snapshotsEqualRecords(draftSnapshot, publishedFields);

  return {
    fields: schemas.map((schema) => ({
      schema,
      draftValue: valueByKey.get(schema.fieldKey) ?? null,
    })),
    hasUnpublishedChanges,
  };
}

function snapshotsEqualRecords(
  left: Record<string, string>,
  right: Record<string, string>,
): boolean {
  const leftKeys = [...Object.keys(left)].sort();
  const rightKeys = [...Object.keys(right)].sort();
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index]!;
    if (key !== rightKeys[index]) {
      return false;
    }
    if (left[key] !== right[key]) {
      return false;
    }
  }
  return true;
}
