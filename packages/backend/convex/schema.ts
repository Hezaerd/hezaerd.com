import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // App-owned user profile. AuthKit component keeps WorkOS auth metadata;
  // this table extends it with portal-specific fields via webhook sync.
  users: defineTable({
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    pictureUrl: v.optional(v.string()),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),
});
