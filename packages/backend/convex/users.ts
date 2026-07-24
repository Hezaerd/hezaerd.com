import { v } from "convex/values";

import { authedQuery } from "./lib/functions";

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  authId: v.string(),
  email: v.string(),
  name: v.string(),
  pictureUrl: v.optional(v.string()),
});

/** Current app user profile (requires WorkOS JWT + webhook-synced `users` row). */
export const me = authedQuery({
  args: {},
  returns: userValidator,
  handler: async (ctx) => {
    return ctx.user;
  },
});
