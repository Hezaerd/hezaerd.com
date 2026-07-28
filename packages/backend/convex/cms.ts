import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { loadDeskFieldRows, loadWorkspaceFields } from "./cmsInternal";
import { authedMutation, authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import { CMS_UNPUBLISHED_COPY } from "./lib/clientNotifications";
import {
  cmsFieldSchemaValidator,
  cmsImageConstraintsValidator,
  cmsTextConstraintsValidator,
  generateDeployTokenPlaintext,
  hashDeployToken,
  signPreviewJwt,
  validateDraftTextValue,
  validateFieldKey,
  validateHttpsSiteUrl,
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

const cmsNeedsAttentionItemValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  clientId: v.string(),
  area: v.literal("cms"),
  kind: v.union(v.literal("cms"), v.literal("feature")),
});

const cmsWaitingItemValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  href: v.string(),
});

async function loadUndismissedCmsFeatureUnlocks(ctx: QueryCtx, clientId: Id<"clients">) {
  const notifications = await ctx.db
    .query("clientNotifications")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();

  return notifications.filter(
    (notification) =>
      notification.kind === "cms_feature_unlock" && notification.dismissedAt === undefined,
  );
}

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

const deskOverviewValidator = v.object({
  cmsSiteUrl: v.union(v.string(), v.null()),
  publishVersion: v.union(v.number(), v.null()),
  publishedAt: v.union(v.number(), v.null()),
});

/** Operator Desk — site URL and publish metadata. */
export const getDeskOverview = operatorQuery({
  args: { slug: v.string() },
  returns: deskOverviewValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const publishState = await ctx.db
      .query("cmsPublishState")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .unique();

    return {
      cmsSiteUrl: client.cmsSiteUrl ?? null,
      publishVersion: publishState?.version ?? null,
      publishedAt: publishState?.publishedAt ?? null,
    };
  },
});

/** Operator Desk — preview base URL for client site. */
export const updateSiteUrl = operatorMutation({
  args: {
    slug: v.string(),
    siteUrl: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const cmsSiteUrl = validateHttpsSiteUrl(args.siteUrl);
    await ctx.db.patch(client._id, { cmsSiteUrl });
    return null;
  },
});

/** Client Workspace — preview link with short-lived JWT. */
export const createPreviewLink = authedMutation({
  args: { slug: v.string() },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (ctx.user.role !== "client") {
      throw new Error("Accès refusé");
    }
    assertCmsFeature(client);

    const siteBaseUrl = client.cmsSiteUrl?.trim();
    if (!siteBaseUrl) {
      throw new Error("URL du site non configurée — contacte ton opérateur");
    }

    const token = await signPreviewJwt({ slug: client.slug });
    const previewUrl = new URL("/preview", siteBaseUrl);
    previewUrl.searchParams.set("token", token);
    return { url: previewUrl.toString() };
  },
});

/** Needs Attention rows for CMS feature unlock and publish-ready drafts. */
export const listNeedsAttention = authedQuery({
  args: { slug: v.string() },
  returns: v.array(cmsNeedsAttentionItemValidator),
  handler: async (ctx, args) => {
    if (ctx.user.role !== "client") {
      return [];
    }

    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!client.features.cms) {
      return [];
    }

    const items: Array<{
      id: string;
      title: string;
      description: string;
      clientId: string;
      area: "cms";
      kind: "cms" | "feature";
    }> = [];

    const unlockNotifications = await loadUndismissedCmsFeatureUnlocks(ctx, client._id);
    for (const notification of unlockNotifications) {
      items.push({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        clientId: client.slug,
        area: "cms",
        kind: "feature",
      });
    }

    const { hasUnpublishedChanges } = await loadWorkspaceFields(ctx, client._id);
    if (hasUnpublishedChanges) {
      items.push({
        id: `cms-unpublished-${client._id}`,
        title: CMS_UNPUBLISHED_COPY.title,
        description: CMS_UNPUBLISHED_COPY.description,
        clientId: client.slug,
        area: "cms",
        kind: "cms",
      });
    }

    return items;
  },
});

/** Waiting on Client rows for CMS feature unlock and publish-ready drafts. */
export const listWaitingOnClient = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(cmsWaitingItemValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!client.features.cms) {
      return [];
    }

    const href = `/op/clients/${client.slug}/cms`;
    const items: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
    }> = [];

    const unlockNotifications = await loadUndismissedCmsFeatureUnlocks(ctx, client._id);
    for (const notification of unlockNotifications) {
      items.push({
        id: notification._id,
        title: notification.title,
        description: notification.description,
        href,
      });
    }

    const { hasUnpublishedChanges } = await loadWorkspaceFields(ctx, client._id);
    if (hasUnpublishedChanges) {
      items.push({
        id: `cms-unpublished-${client._id}`,
        title: CMS_UNPUBLISHED_COPY.title,
        description: CMS_UNPUBLISHED_COPY.description,
        href,
      });
    }

    return items;
  },
});

/** Dismiss undismissed CMS feature-unlock notifications after Mon site visit. */
export const acknowledgeFeatureUnlock = authedMutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (ctx.user.role !== "client") {
      return null;
    }
    if (!client.features.cms) {
      return null;
    }

    const unlockNotifications = await loadUndismissedCmsFeatureUnlocks(ctx, client._id);
    if (unlockNotifications.length === 0) {
      return null;
    }

    const dismissedAt = Date.now();
    for (const notification of unlockNotifications) {
      await ctx.db.patch(notification._id, { dismissedAt });
    }

    return null;
  },
});
