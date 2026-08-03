import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Linked site — URL prod, repo GitHub, siteKey analytics si configuré.",
  inputSchema: z.object({
    slug: z.string().min(1),
  }),
  async execute({ slug }) {
    const [site, health] = await Promise.all([
      marionAction(api.marionRead.getLinkedSite, { slug }),
      marionAction(api.marionRead.checkLinkedSiteHealth, { slug }),
    ]);
    return { site, health };
  },
});
