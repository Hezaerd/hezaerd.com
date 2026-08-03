import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Recherche sémantique dans la mémoire stable operator (namespace RAG).",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).optional(),
  }),
  async execute({ query, limit }) {
    return marionAction(api.marionMemory.searchMemory, { query, limit });
  },
});
