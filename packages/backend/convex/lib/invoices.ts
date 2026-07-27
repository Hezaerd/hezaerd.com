import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

import { v } from "convex/values";

import { getClientBySlug } from "./clients";

type DbCtx = QueryCtx | MutationCtx;

export const CHECKOUT_TTL_MS = 23 * 60 * 60 * 1000;

export const invoiceStatusValidator = v.union(
  v.literal("draft"),
  v.literal("open"),
  v.literal("paid"),
  v.literal("cancelled"),
);

export const paymentMethodValidator = v.union(v.literal("stripe"), v.literal("bank_wire"));

export const invoicePaymentValidator = v.object({
  method: paymentMethodValidator,
  paidAt: v.number(),
  stripeSessionId: v.optional(v.string()),
  transferRef: v.optional(v.string()),
});

export const invoiceValidator = v.object({
  _id: v.id("invoices"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  number: v.number(),
  label: v.string(),
  amountCents: v.number(),
  currency: v.literal("eur"),
  status: invoiceStatusValidator,
  dueDate: v.optional(v.number()),
  openedAt: v.optional(v.number()),
  stripeCheckoutSessionId: v.optional(v.string()),
  checkoutUrl: v.optional(v.string()),
  checkoutExpiresAt: v.optional(v.number()),
  payment: v.optional(invoicePaymentValidator),
});

export async function getInvoiceOrThrow(
  ctx: DbCtx,
  invoiceId: Id<"invoices">,
): Promise<Doc<"invoices">> {
  const invoice = await ctx.db.get("invoices", invoiceId);
  if (!invoice) {
    throw new Error("Facture introuvable");
  }
  return invoice;
}

export async function assertOperatorInvoiceAccess(
  ctx: DbCtx,
  user: Doc<"users">,
  invoice: Doc<"invoices">,
): Promise<Doc<"clients">> {
  if (user.role !== "operator") {
    throw new Error("Unauthorized: Operator access required");
  }
  const client = await ctx.db.get("clients", invoice.clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
}

export async function assertClientInvoiceAccess(
  ctx: DbCtx,
  user: Doc<"users">,
  invoice: Doc<"invoices">,
): Promise<Doc<"clients">> {
  if (user.role !== "client" || user.clientId !== invoice.clientId) {
    throw new Error("Unauthorized: You don't have access to this invoice");
  }
  const client = await ctx.db.get("clients", invoice.clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
}

export async function allocateInvoiceNumber(ctx: MutationCtx): Promise<number> {
  const counter = await ctx.db
    .query("invoiceCounters")
    .withIndex("by_key", (q) => q.eq("key", "global"))
    .unique();

  if (!counter) {
    await ctx.db.insert("invoiceCounters", { key: "global", nextNumber: 2 });
    return 1;
  }

  const number = counter.nextNumber;
  await ctx.db.patch(counter._id, { nextNumber: number + 1 });
  return number;
}

export async function getClientBySlugOrThrow(ctx: DbCtx, slug: string): Promise<Doc<"clients">> {
  const client = await getClientBySlug(ctx, slug);
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
}

export function isCheckoutSessionUsable(invoice: Doc<"invoices">): boolean {
  return Boolean(
    invoice.status === "open" &&
      invoice.checkoutUrl &&
      invoice.checkoutExpiresAt &&
      invoice.checkoutExpiresAt > Date.now(),
  );
}

export function startOfMonthMs(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}
