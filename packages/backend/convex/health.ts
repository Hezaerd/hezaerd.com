import { v } from "convex/values";

import { query } from "./_generated/server";

export const ping = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async () => {
    return { ok: true as const };
  },
});
