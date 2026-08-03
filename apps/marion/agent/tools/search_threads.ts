import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Hybrid search sur les messages de threads Discord (verbatim récent).",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(20).optional(),
  }),
  async execute({ query, limit }) {
    return marionAction(api.marionMemory.searchThreads, { query, limit });
  },
});
