import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    slug: v.string(),
    contactEmail: v.string(),
    features: v.object({
      insights: v.boolean(),
      website: v.boolean(),
    }),
  })
    .index("by_slug", ["slug"])
    .index("by_contactEmail", ["contactEmail"]),

  // App-owned user profile. AuthKit component keeps WorkOS auth metadata;
  // this table extends it with portal-specific fields via webhook sync.
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
});
