import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";

export default defineTool({
  description:
    "Mémorise un fait ou une préférence stable de Hezaerd pour les prochaines sessions.",
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_.-]+$/)
      .describe("Identifiant court, ex. preference.invoice_day"),
    value: z.string().min(1).max(4000),
  }),
  async execute({ key, value }) {
    const entry = await memoryStore.put({ key, value, kind: "fact" });
    return { saved: true, entry };
  },
});
