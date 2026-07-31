import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

async function deleteAnalyticsRowsByClient(
  ctx: MutationCtx,
  table:
    | "analyticsDailyTotals"
    | "analyticsDailyPages"
    | "analyticsDailySources"
    | "analyticsDailyRoutes"
    | "analyticsDailyEvents"
    | "analyticsVisitorDays"
    | "analyticsSessions",
  clientId: Id<"clients">,
): Promise<void> {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
    .collect();

  for (const row of rows) {
    await ctx.db.delete(row._id);
  }
}

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

  const fileRequests = await ctx.db
    .query("fileRequests")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();

  for (const request of fileRequests) {
    const slots = await ctx.db
      .query("fileRequestSlots")
      .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
      .collect();
    for (const slot of slots) {
      await ctx.db.delete(slot._id);
    }
    await ctx.db.delete(request._id);
  }

  const notifications = await ctx.db
    .query("clientNotifications")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();

  for (const notification of notifications) {
    await ctx.db.delete(notification._id);
  }

  const analyticsSite = await ctx.db
    .query("analyticsSites")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();
  if (analyticsSite) {
    await ctx.db.delete(analyticsSite._id);
  }

  await deleteAnalyticsRowsByClient(ctx, "analyticsDailyTotals", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsDailyPages", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsDailySources", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsDailyRoutes", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsDailyEvents", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsVisitorDays", clientId);
  await deleteAnalyticsRowsByClient(ctx, "analyticsSessions", clientId);

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
