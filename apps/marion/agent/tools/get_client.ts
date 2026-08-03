import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Charge un Client Portal par slug (Client Desk key).",
  inputSchema: z.object({
    slug: z.string().min(1).describe("Client slug, ex. yanne-boulangerie"),
  }),
  async execute({ slug }) {
    return marionAction(api.marionRead.getClient, { slug });
  },
});
