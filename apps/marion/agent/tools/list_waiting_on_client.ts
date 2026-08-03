import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description:
    "File Waiting on Client — factures impayées et file requests en attente (global ou par Client slug).",
  inputSchema: z.object({
    slug: z
      .string()
      .optional()
      .describe("Client slug optionnel ; omit pour la vue globale practice"),
  }),
  async execute({ slug }) {
    return marionAction(api.marionRead.listWaitingOnClient, { slug });
  },
});
