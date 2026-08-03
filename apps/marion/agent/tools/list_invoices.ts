import { defineTool } from "eve/tools";
import { z } from "zod";

import { api, marionAction } from "../lib/convex";

export default defineTool({
  description: "Factures Desk — ledger global ou section Invoices d'un Client.",
  inputSchema: z.object({
    slug: z.string().optional().describe("Client slug ; omit pour le ledger global Operator"),
  }),
  async execute({ slug }) {
    return marionAction(api.marionRead.listInvoices, { slug });
  },
});
