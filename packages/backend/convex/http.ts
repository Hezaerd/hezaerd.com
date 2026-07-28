import { httpRouter } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import type Stripe from "stripe";

import { authKit } from "./auth";
import { registerCmsRoutes } from "./cmsHttp";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();
authKit.registerRoutes(http);

registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  events: {
    "checkout.session.completed": async (ctx, event: Stripe.CheckoutSessionCompletedEvent) => {
      const session = event.data.object;
      const portalInvoiceId = session.metadata?.portalInvoiceId;
      if (!portalInvoiceId) {
        return;
      }

      await ctx.runMutation(internal.invoiceInternal.markPaidFromStripe, {
        portalInvoiceId: portalInvoiceId as Id<"invoices">,
        stripeSessionId: session.id,
      });
    },
  },
});

registerCmsRoutes(http);

export default http;
