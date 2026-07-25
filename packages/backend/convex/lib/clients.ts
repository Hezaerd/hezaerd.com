import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = QueryCtx | MutationCtx;

export function normalizeSlug(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) {
    throw new Error("Slug invalide");
  }
  return slug;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getClientBySlug(
  ctx: DbCtx,
  slug: string,
): Promise<Doc<"clients"> | null> {
  return await ctx.db
    .query("clients")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function assertUniqueSlug(ctx: DbCtx, slug: string): Promise<void> {
  const existing = await getClientBySlug(ctx, slug);
  if (existing) {
    throw new Error("Ce slug est déjà utilisé");
  }
}

export async function assertUniqueContactEmail(ctx: DbCtx, contactEmail: string): Promise<void> {
  const normalized = normalizeEmail(contactEmail);
  const existing = await ctx.db
    .query("clients")
    .withIndex("by_contactEmail", (q) => q.eq("contactEmail", normalized))
    .unique();
  if (existing) {
    throw new Error("Cet e-mail de contact est déjà utilisé");
  }
}

export async function tryBindSeatByEmail(
  ctx: MutationCtx,
  userId: Id<"users">,
  email: string,
): Promise<void> {
  const normalized = normalizeEmail(email);
  const matchingClients = await ctx.db
    .query("clients")
    .withIndex("by_contactEmail", (q) => q.eq("contactEmail", normalized))
    .collect();

  if (matchingClients.length !== 1) {
    return;
  }

  const client = matchingClients[0]!;

  const existingSeat = await ctx.db
    .query("users")
    .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
    .unique();

  if (existingSeat && existingSeat._id !== userId) {
    return;
  }

  const user = await ctx.db.get("users", userId);
  if (!user) {
    return;
  }

  if (user.clientId === client._id) {
    return;
  }

  await ctx.db.patch(userId, { clientId: client._id });
}
