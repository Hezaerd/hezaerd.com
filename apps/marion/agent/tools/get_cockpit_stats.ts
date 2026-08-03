import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Practice Cockpit — factures ouvertes, encaissé ce mois, clients en attente, actifs.",
  inputSchema: z.object({}),
  async execute() {
    return marionAction(api.marionRead.getCockpitStats, {});
  },
});
