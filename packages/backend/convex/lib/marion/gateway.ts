import { createGateway } from "@ai-sdk/gateway";

/** Single AI Gateway client for Marion Convex actions (RAG, embeddings, summarize). */
export const marionGateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

/**
 * Model IDs — Vercel AI Gateway `creator/model-name` format.
 * Override via Convex env without redeploying Eve.
 *
 * @see apps/marion/docs/research/marion-ai-gateway-models.md
 */
export const MARION_MODEL_IDS = {
  /** Discord chat + tools — default production pick. */
  chat: process.env.MARION_CHAT_MODEL ?? "openai/gpt-5.4-mini",
  /** Post-session thread summarize — cheap background. */
  summarize: process.env.MARION_SUMMARIZE_MODEL ?? "openai/gpt-5.4-nano",
  /** RAG + thread hybrid search — keep 1536 dims (text-embedding-3-small). */
  embedding: process.env.MARION_EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
} as const;

/** Must match `openai/text-embedding-3-small` output size. */
export const MARION_EMBEDDING_DIMENSION = 1536;

export function marionChatModel() {
  return marionGateway(MARION_MODEL_IDS.chat);
}

export function marionSummarizeModel() {
  return marionGateway(MARION_MODEL_IDS.summarize);
}

export function marionEmbeddingModel() {
  return marionGateway.textEmbeddingModel(MARION_MODEL_IDS.embedding);
}
