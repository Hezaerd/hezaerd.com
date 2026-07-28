import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { loadDeskFieldRows, loadWorkspaceFields } from "./cmsInternal";
import { authedMutation, authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import {
  cmsFieldSchemaValidator,
  cmsImageConstraintsValidator,
  cmsTextConstraintsValidator,
  generateDeployTokenPlaintext,
  hashDeployToken,
  validateDraftTextValue,
  validateFieldKey,
} from "./lib/cms";
import { assertClientAccess } from "./lib/users";

const cmsFieldSchemaDocValidator = cmsFieldSchemaValidator.extend({
  _id: v.id("cmsFieldSchemas"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  constraints: v.union(cmsTextConstraintsValidator, cmsImageConstraintsValidator),
});

const deskFieldRowValidator = v.object({
  schema: cmsFieldSchemaDocValidator,
  draftValue: v.union(v.string(), v.null()),
  publishedValue: v.union(v.string(), v.null()),
});

const workspaceFieldRowValidator = v.object({
  schema: cmsFieldSchemaDocValidator,
  draftValue: v.union(v.string(), v.null()),
});

const deployTokenRowValidator = v.object({
  id: v.id("cmsDeployTokens"),
  label: v.optional(v.string()),
  createdAt: v.number(),
  revokedAt: v.optional(v.number()),
});

function assertCmsFeature(client: Doc<"clients">): void {
  if (!client.features.cms) {
    throw new Error("CMS non activé");
  }
}

/** Operator Desk — registered fields with draft and published values. */
export const listSchemaForDesk = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(deskFieldRowValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    return loadDeskFieldRows(ctx, client._id);
  },
});

/** Operator Desk — deploy tokens for CI registerSchema. */
export const getDeployTokens = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(deployTokenRowValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const tokens = await ctx.db
      .query("cmsDeployTokens")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();

    tokens.sort((a, b) => b.createdAt - a.createdAt);

    return tokens.map((token) => ({
      id: token._id,
      label: token.label,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt,
    }));
  },
});

/** Create a deploy token — plaintext returned once. */
export const createDeployToken = operatorMutation({
  args: {
    slug: v.string(),
    label: v.optional(v.string()),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const plaintext = generateDeployTokenPlaintext();
    const tokenHash = await hashDeployToken(plaintext);

    await ctx.db.insert("cmsDeployTokens", {
      clientId: client._id,
      tokenHash,
      label: args.label?.trim() || undefined,
      createdAt: Date.now(),
    });

    return { token: plaintext };
  },
});

/** Revoke a deploy token. */
export const revokeDeployToken = operatorMutation({
  args: {
    slug: v.string(),
    tokenId: v.id("cmsDeployTokens"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const token = await ctx.db.get("cmsDeployTokens", args.tokenId);
    if (!token || token.clientId !== client._id) {
      throw new Error("Token deploy introuvable");
    }
    if (token.revokedAt !== undefined) {
      return null;
    }
    await ctx.db.patch(args.tokenId, { revokedAt: Date.now() });
    return null;
  },
});

/** Patch display label on an existing schema row. */
export const updateFieldLabel = operatorMutation({
  args: {
    slug: v.string(),
    fieldKey: v.string(),
    label: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const fieldKey = validateFieldKey(args.fieldKey);
    const label = args.label.trim();
    if (!label) {
      throw new Error("Label requis");
    }

    const schema = await ctx.db
      .query("cmsFieldSchemas")
      .withIndex("by_clientId_and_fieldKey", (q) =>
        q.eq("clientId", client._id).eq("fieldKey", fieldKey),
      )
      .unique();
    if (!schema) {
      throw new Error("Champ introuvable");
    }

    await ctx.db.patch(schema._id, { label });
    return null;
  },
});

/** Patch default value for text fields. */
export const updateFieldDefault = operatorMutation({
  args: {
    slug: v.string(),
    fieldKey: v.string(),
    defaultValue: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const fieldKey = validateFieldKey(args.fieldKey);

    const schema = await ctx.db
      .query("cmsFieldSchemas")
      .withIndex("by_clientId_and_fieldKey", (q) =>
        q.eq("clientId", client._id).eq("fieldKey", fieldKey),
      )
      .unique();
    if (!schema) {
      throw new Error("Champ introuvable");
    }
    if (schema.type !== "text") {
      throw new Error("Default réservé aux champs texte");
    }

    const defaultValue = validateDraftTextValue(schema, args.defaultValue);
    await ctx.db.patch(schema._id, { defaultValue });
    return null;
  },
});

/** Client Workspace — editable fields and publish diff flag. */
export const listFieldsForWorkspace = authedQuery({
  args: { slug: v.string() },
  returns: v.object({
    fields: v.array(workspaceFieldRowValidator),
    hasUnpublishedChanges: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (ctx.user.role !== "client") {
      throw new Error("Accès refusé");
    }
    assertCmsFeature(client);
    return loadWorkspaceFields(ctx, client._id);
  },
});

/** Client Workspace — upsert a text draft value. */
export const upsertDraftText = authedMutation({
  args: {
    slug: v.string(),
    fieldKey: v.string(),
    value: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (ctx.user.role !== "client") {
      throw new Error("Accès refusé");
    }
    assertCmsFeature(client);

    const fieldKey = validateFieldKey(args.fieldKey);
    const schema = await ctx.db
      .query("cmsFieldSchemas")
      .withIndex("by_clientId_and_fieldKey", (q) =>
        q.eq("clientId", client._id).eq("fieldKey", fieldKey),
      )
      .unique();
    if (!schema || schema.deprecated) {
      throw new Error("Champ introuvable");
    }

    const draftValue = validateDraftTextValue(schema, args.value);
    const existing = await ctx.db
      .query("cmsFieldValues")
      .withIndex("by_clientId_and_fieldKey", (q) =>
        q.eq("clientId", client._id).eq("fieldKey", fieldKey),
      )
      .unique();

    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { draftValue, updatedAt });
    } else {
      await ctx.db.insert("cmsFieldValues", {
        clientId: client._id,
        fieldKey,
        draftValue,
        updatedAt,
      });
    }

    return null;
  },
});
