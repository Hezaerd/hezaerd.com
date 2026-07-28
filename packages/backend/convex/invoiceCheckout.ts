"use node";

import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { CHECKOUT_TTL_MS, isCheckoutSessionUsable } from "./lib/invoices";

const stripeClient = new StripeSubscriptions(components.stripe, {});

async function ensureStripeCustomer(
  ctx: Parameters<typeof stripeClient.createCustomer>[0],
  client: {
    _id: Id<"clients">;
    slug: string;
    name: string;
    contactEmail: string;
    stripeCustomerId?: string;
  },
): Promise<string> {
  if (client.stripeCustomerId) {
    return client.stripeCustomerId;
  }

  const created = await stripeClient.createCustomer(ctx, {
    email: client.contactEmail,
    name: client.name,
    metadata: {
      portalClientSlug: client.slug,
    },
    idempotencyKey: client.slug,
  });

  await ctx.runMutation(internal.invoiceInternal.setClientStripeCustomerId, {
    clientId: client._id,
    stripeCustomerId: created.customerId,
  });

  return created.customerId;
}

/** Client Pay — hybrid Checkout session cache. */
export const startCheckout = action({
  args: {
    invoiceId: v.id("invoices"),
    returnBaseUrl: v.string(),
  },
  returns: v.object({
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args): Promise<{ url: string | null }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });
    if (!user) {
      throw new Error("User profile not synced yet");
    }

    await ctx.runQuery(internal.invoiceInternal.assertClientCanPay, {
      userId: user._id,
      invoiceId: args.invoiceId,
    });

    const invoice: Doc<"invoices"> = await ctx.runQuery(
      internal.invoiceInternal.getInvoiceForAction,
      {
        invoiceId: args.invoiceId,
      },
    );

    const client = await ctx.runQuery(internal.invoiceInternal.getClientForInvoice, {
      invoiceId: args.invoiceId,
    });

    if (isCheckoutSessionUsable(invoice)) {
      return { url: invoice.checkoutUrl ?? null };
    }

    const customerId = await ensureStripeCustomer(ctx, client);
    const portalInvoiceId = invoice._id;

    const successUrl = `${args.returnBaseUrl}/w/${client.slug}/invoices?paid=${portalInvoiceId}`;
    const cancelUrl = `${args.returnBaseUrl}/w/${client.slug}/invoices?cancelled=${portalInvoiceId}`;

    const result = await stripeClient.createCheckoutSession(ctx, {
      priceId: "price_portal_placeholder",
      customerId,
      mode: "payment",
      successUrl,
      cancelUrl,
      metadata: {
        portalInvoiceId,
        portalClientSlug: client.slug,
      },
      paymentIntentMetadata: {
        portalInvoiceId,
        portalClientSlug: client.slug,
      },
      params: {
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: invoice.currency,
              unit_amount: invoice.amountCents,
              product_data: {
                name: `Facture n°${invoice.number}`,
                description: invoice.label,
              },
            },
          },
        ],
        payment_method_types: ["card", "sepa_debit"],
      },
    });

    await ctx.runMutation(internal.invoiceInternal.cacheCheckoutSession, {
      invoiceId: invoice._id,
      stripeCheckoutSessionId: result.sessionId,
      checkoutUrl: result.url ?? undefined,
      checkoutExpiresAt: Date.now() + CHECKOUT_TTL_MS,
    });

    return { url: result.url };
  },
});
