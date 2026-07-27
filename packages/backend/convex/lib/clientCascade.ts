import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/** Delete all Portal data owned by one Client. */
export async function cascadeDeleteClient(
  ctx: MutationCtx,
  clientId: Id<"clients">,
): Promise<{ deletedAuthId?: string }> {
  const invoices = await ctx.db
    .query("invoices")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();

  for (const invoice of invoices) {
    await ctx.db.delete(invoice._id);
  }

  const seat = await ctx.db
    .query("users")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();

  let deletedAuthId: string | undefined;
  if (seat) {
    deletedAuthId = seat.authId;
    await ctx.db.delete(seat._id);
  }

  await ctx.db.delete(clientId);

  return { deletedAuthId };
}
