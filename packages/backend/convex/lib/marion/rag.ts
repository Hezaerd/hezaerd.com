import { RAG } from "@convex-dev/rag";

import { components } from "../../_generated/api";
import {
  MARION_EMBEDDING_DIMENSION,
  marionEmbeddingModel,
} from "./gateway";

export const MARION_RAG_NAMESPACE = "operator";

export const marionRag = new RAG(components.rag, {
  textEmbeddingModel: marionEmbeddingModel(),
  embeddingDimension: MARION_EMBEDDING_DIMENSION,
});

export { marionEmbeddingModel };
