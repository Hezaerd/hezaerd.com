import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description:
    "Enregistre un fait stable dans la mémoire operator (ex. « retiens que… »). Indexation immédiate RAG.",
  inputSchema: z.object({
    text: z.string().min(1),
    key: z.string().optional().describe("Clé de remplacement si le fait évolue"),
  }),
  async execute({ text, key }) {
    return marionAction(api.marionMemory.saveMemory, { text, key });
  },
});
