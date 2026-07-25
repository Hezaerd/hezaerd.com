import { defineTool } from "eve/tools";
import { z } from "zod";
import { memoryStore } from "../lib/memory-store";

export default defineTool({
  description:
    "Enregistre une leçon / playbook appris en situation (auto-instruction pour plus tard).",
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_.-]+$/)
      .describe("Identifiant, ex. playbook.client_ghost"),
    title: z.string().min(1).max(120),
    lesson: z
      .string()
      .min(1)
      .max(6000)
      .describe("Ce qui a marché, quand l’appliquer, pièges à éviter."),
  }),
  async execute({ key, title, lesson }) {
    const value = `# ${title}\n\n${lesson.trim()}`;
    const entry = await memoryStore.put({
      key: key.startsWith("lesson.") ? key : `lesson.${key}`,
      value,
      kind: "lesson",
    });
    return { saved: true, entry };
  },
});
