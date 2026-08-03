/**
 * Marion model IDs — must stay aligned with `packages/backend/convex/lib/marion/gateway.ts`.
 * @see apps/marion/docs/research/marion-ai-gateway-models.md
 */
export const MARION_CHAT_MODEL =
  process.env.MARION_CHAT_MODEL ?? "openai/gpt-5.4-mini";

/** Fallback if primary is unavailable (AI Gateway providerOptions.models). */
export const MARION_CHAT_MODEL_FALLBACK =
  process.env.MARION_CHAT_MODEL_FALLBACK ?? "openai/gpt-4o-mini";
