import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Insights Desk (Statistiques) — overview trafic pour un Client avec linked site.",
  inputSchema: z.object({
    slug: z.string().min(1),
    period: z.enum(["7d", "30d", "90d"]).default("30d"),
  }),
  async execute({ slug, period }) {
    return marionAction(api.marionRead.getInsights, { slug, period });
  },
});
