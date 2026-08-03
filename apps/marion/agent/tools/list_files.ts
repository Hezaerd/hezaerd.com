import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Files Desk — file requests et slots pour un Client.",
  inputSchema: z.object({
    slug: z.string().min(1).describe("Client slug"),
  }),
  async execute({ slug }) {
    return marionAction(api.marionRead.listFiles, { slug });
  },
});
