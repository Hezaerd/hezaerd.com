import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";

export default defineTool({
  description:
    "Liste ou retrouve la mémoire longue (faits + leçons). Sans clé = tout lister.",
  inputSchema: z.object({
    key: z.string().min(1).max(80).optional(),
    kind: z.enum(["fact", "lesson"]).optional(),
  }),
  async execute({ key, kind }) {
    if (key) {
      const entry = await memoryStore.get(key);
      return { entry };
    }
    const entries = await memoryStore.list({ limit: 50, kind });
    return { count: entries.length, entries };
  },
});
