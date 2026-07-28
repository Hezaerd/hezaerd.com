import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    slug: v.string(),
    contactEmail: v.string(),
    stripeCustomerId: v.optional(v.string()),
    workosInvitationId: v.optional(v.string()),
    features: v.object({
      insights: v.boolean(),
      cms: v.boolean(),
    }),
    fileSettings: v.optional(
      v.object({
        defaultMaxFileSizeMb: v.number(),
        uploadPresignTtlHours: v.number(),
        downloadPresignTtlMinutes: v.number(),
      }),
    ),
    cmsSiteUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_contactEmail", ["contactEmail"]),

  invoiceCounters: defineTable({
    key: v.literal("global"),
    nextNumber: v.number(),
  }).index("by_key", ["key"]),

  invoices: defineTable({
    clientId: v.id("clients"),
    number: v.number(),
    label: v.string(),
    amountCents: v.number(),
    currency: v.literal("eur"),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("paid"),
      v.literal("cancelled"),
    ),
    dueDate: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    stripeCheckoutSessionId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    checkoutExpiresAt: v.optional(v.number()),
    payment: v.optional(
      v.object({
        method: v.union(v.literal("stripe"), v.literal("bank_wire")),
        paidAt: v.number(),
        stripeSessionId: v.optional(v.string()),
        transferRef: v.optional(v.string()),
      }),
    ),
  })
    .index("by_clientId", ["clientId"])
    .index("by_clientId_and_status", ["clientId", "status"])
    .index("by_status", ["status"])
    .index("by_number", ["number"]),

  // App-owned user profile. AuthKit component keeps WorkOS auth metadata;
  // this table extends it with portal-specific fields via webhook sync.
  fileRequests: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    instructions: v.optional(v.string()),
    maxFileSizeMb: v.number(),
    status: v.union(v.literal("active"), v.literal("cancelled")),
    cancelledReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_clientId_and_status", ["clientId", "status"]),

  fileRequestSlots: defineTable({
    requestId: v.id("fileRequests"),
    clientId: v.id("clients"),
    label: v.string(),
    sortOrder: v.number(),
    allowedExtensions: v.array(v.string()),
    file: v.optional(
      v.object({
        r2Key: v.string(),
        fileName: v.string(),
        contentType: v.string(),
        sizeBytes: v.number(),
        uploadedAt: v.number(),
        replacedAt: v.optional(v.number()),
        previousFileName: v.optional(v.string()),
      }),
    ),
  })
    .index("by_requestId", ["requestId"])
    .index("by_clientId", ["clientId"]),

  clientNotifications: defineTable({
    clientId: v.id("clients"),
    kind: v.union(v.literal("file_request_cancelled"), v.literal("file_slot_removed")),
    title: v.string(),
    description: v.string(),
    dismissedAt: v.optional(v.number()),
  }).index("by_clientId", ["clientId"]),

  users: defineTable({
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    pictureUrl: v.optional(v.string()),
    role: v.union(v.literal("operator"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"])
    .index("by_clientId", ["clientId"]),

  cmsFieldSchemas: defineTable({
    clientId: v.id("clients"),
    fieldKey: v.string(),
    type: v.union(v.literal("text"), v.literal("image")),
    constraints: v.union(
      v.object({
        maxLength: v.number(),
        multiline: v.optional(v.boolean()),
      }),
      v.object({
        aspect: v.string(),
        maxWidth: v.number(),
        priority: v.optional(v.boolean()),
      }),
    ),
    label: v.optional(v.string()),
    defaultValue: v.optional(v.string()),
    deprecated: v.optional(v.boolean()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_clientId_and_fieldKey", ["clientId", "fieldKey"]),

  cmsFieldValues: defineTable({
    clientId: v.id("clients"),
    fieldKey: v.string(),
    draftValue: v.string(),
    updatedAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_clientId_and_fieldKey", ["clientId", "fieldKey"]),

  cmsDeployTokens: defineTable({
    clientId: v.id("clients"),
    tokenHash: v.string(),
    label: v.optional(v.string()),
    createdAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_tokenHash", ["tokenHash"]),

  cmsPublishState: defineTable({
    clientId: v.id("clients"),
    version: v.number(),
    publishedAt: v.optional(v.number()),
    r2Key: v.optional(v.string()),
    publishedFields: v.optional(v.record(v.string(), v.string())),
  }).index("by_clientId", ["clientId"]),
});
