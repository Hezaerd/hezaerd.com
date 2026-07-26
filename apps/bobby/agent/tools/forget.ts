import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";

export default defineTool({
  description: "Supprime une entrée de mémoire longue (fait ou leçon).",
  inputSchema: z.object({
    key: z.string().min(1).max(80),
  }),
  approval: always(),
  async execute({ key }) {
    const deleted = await memoryStore.delete(key);
    return { deleted, key };
  },
});
