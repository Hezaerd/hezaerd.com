import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Liste tous les Clients Portal (Operator Home / directory).",
  inputSchema: z.object({}),
  async execute() {
    return marionAction(api.marionRead.listClients, {});
  },
});
