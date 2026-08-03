import { v } from "convex/values";

/** Validates Marion server-to-server secret (ConvexHttpClient from apps/marion). */
export function assertMarionServiceSecret(provided: string | undefined): void {
  const expected = process.env.MARION_SERVICE_SECRET;
  if (!expected || !provided || provided !== expected) {
    throw new Error("Unauthorized: invalid Marion service secret");
  }
}

export const marionServiceSecretValidator = v.object({
  serviceSecret: v.string(),
});
