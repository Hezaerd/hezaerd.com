import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";

import { mutation, query } from "../_generated/server";
import { requireAppUser, requireOperator } from "./users";

/**
 * Authenticated query. Handler receives `ctx.user` (app profile) and `ctx.authUser` (WorkOS).
 */
export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const { authUser, user } = await requireAppUser(ctx);
    return { ctx: { ...ctx, authUser, user }, args };
  },
});

/**
 * Authenticated mutation. Handler receives `ctx.user` (app profile) and `ctx.authUser` (WorkOS).
 */
export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const { authUser, user } = await requireAppUser(ctx);
    return { ctx: { ...ctx, authUser, user }, args };
  },
});

/** Operator-only query. */
export const operatorQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const { authUser, user } = await requireAppUser(ctx);
    await requireOperator(ctx, user);
    return { ctx: { ...ctx, authUser, user }, args };
  },
});

/** Operator-only mutation. */
export const operatorMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const { authUser, user } = await requireAppUser(ctx);
    await requireOperator(ctx, user);
    return { ctx: { ...ctx, authUser, user }, args };
  },
});
