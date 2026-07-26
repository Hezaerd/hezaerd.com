import { defineTool } from "eve/tools";
import { z } from "zod";

/** Stub until Bobby is wired to Operator Convex queries. */
export default defineTool({
  description:
    "Vérifie que Bobby est vivant et rappelle son rôle (co-pilote Operator). Pas de données Portal.",
  inputSchema: z.object({}),
  async execute() {
    return {
      ok: true,
      agent: "Bobby",
      role: "business co-pilot (Operator)",
      portal: "not connected yet",
      note: "Prochaine étape: outils Convex (queues Client Desk, Practice Cockpit).",
    };
  },
});
