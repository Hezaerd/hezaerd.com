import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import {
  assertClientInvoiceAccess,
  getInvoiceOrThrow,
  invoiceValidator,
} from "./lib/invoices";

export const getInvoiceForAction = internalQuery({
  args: { invoiceId: v.id("invoices") },
  returns: invoiceValidator,
  handler: async (ctx, args) => {
    return await getInvoiceOrThrow(ctx, args.invoiceId);
  },
});

export const getClientForInvoice = internalQuery({
  args: { invoiceId: v.id("invoices") },
  returns: v.object({
    _id: v.id("clients"),
    slug: v.string(),
    name: v.string(),
    contactEmail: v.string(),
    stripeCustomerId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const invoice = await getInvoiceOrThrow(ctx, args.invoiceId);
    const client = await ctx.db.get("clients", invoice.clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    return {
      _id: client._id,
      slug: client.slug,
      name: client.name,
      contactEmail: client.contactEmail,
      stripeCustomerId: client.stripeCustomerId,
    };
  },
});

export const assertClientCanPay = internalQuery({
  args: {
    userId: v.id("users"),
    invoiceId: v.id("invoices"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const invoice = await getInvoiceOrThrow(ctx, args.invoiceId);
    await assertClientInvoiceAccess(ctx, user, invoice);
    if (invoice.status !== "open") {
      throw new Error("Cette facture n'est pas payable");
    }
    return null;
  },
});

export const setClientStripeCustomerId = internalMutation({
  args: {
    clientId: v.id("clients"),
    stripeCustomerId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clientId, { stripeCustomerId: args.stripeCustomerId });
    return null;
  },
});

export const cacheCheckoutSession = internalMutation({
  args: {
    invoiceId: v.id("invoices"),
    stripeCheckoutSessionId: v.string(),
    checkoutUrl: v.optional(v.string()),
    checkoutExpiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invoiceId, {
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      checkoutUrl: args.checkoutUrl,
      checkoutExpiresAt: args.checkoutExpiresAt,
    });
    return null;
  },
});

export const markPaidFromStripe = internalMutation({
  args: {
    portalInvoiceId: v.id("invoices"),
    stripeSessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const invoice = await getInvoiceOrThrow(ctx, args.portalInvoiceId);

    if (invoice.status === "paid") {
      return null;
    }
    if (invoice.status !== "open") {
      console.warn(`Ignoring Stripe payment for invoice ${invoice._id} in status ${invoice.status}`);
      return null;
    }

    await ctx.db.patch(invoice._id, {
      status: "paid",
      payment: {
        method: "stripe",
        paidAt: Date.now(),
        stripeSessionId: args.stripeSessionId,
      },
      stripeCheckoutSessionId: undefined,
      checkoutUrl: undefined,
      checkoutExpiresAt: undefined,
    });

    return null;
  },
});
