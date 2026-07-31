import { v } from "convex/values";

export const sourceKindValidator = v.union(
  v.literal("google"),
  v.literal("direct"),
  v.literal("social"),
  v.literal("referral"),
  v.literal("email"),
  v.literal("other"),
);

export type SourceKind =
  | "google"
  | "direct"
  | "social"
  | "referral"
  | "email"
  | "other";

export const SESSION_GAP_MS = 30 * 60 * 1000;

export const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;
