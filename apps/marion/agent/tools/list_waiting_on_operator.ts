import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description:
    "File Waiting on Operator — brouillons et follow-ups practice-side (global ou par Client slug).",
  inputSchema: z.object({
    slug: z.string().optional().describe("Client slug optionnel"),
  }),
  async execute({ slug }) {
    return marionAction(api.marionRead.listWaitingOnOperator, { slug });
  },
});
