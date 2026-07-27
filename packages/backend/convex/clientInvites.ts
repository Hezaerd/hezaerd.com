"use node";

import { WorkOS } from "@workos-inc/node";
import type { Invitation } from "@workos-inc/node";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { action, internalAction } from "./_generated/server";
import { isOperatorEmail } from "./lib/users";

export const clientAccessStatusValidator = v.union(
  v.object({
    kind: v.literal("connected"),
    userName: v.string(),
    userEmail: v.string(),
  }),
  v.object({
    kind: v.literal("pending"),
    invitationId: v.string(),
    expiresAt: v.string(),
  }),
  v.object({
    kind: v.literal("accepted"),
    invitationId: v.string(),
  }),
  v.object({
    kind: v.literal("expired"),
    invitationId: v.optional(v.string()),
  }),
  v.object({
    kind: v.literal("revoked"),
  }),
  v.object({
    kind: v.literal("none"),
  }),
);

export type ClientAccessStatus = typeof clientAccessStatusValidator.type;

function getWorkOSClient(): WorkOS {
  const apiKey = process.env.WORKOS_API_KEY;
  if (!apiKey) {
    throw new Error("WORKOS_API_KEY is not configured");
  }
  return new WorkOS(apiKey);
}

async function requireOperatorAction(ctx: ActionCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.runQuery(internal.users.getByAuthId, {
    authId: identity.subject,
  });
  if (!user || user.role !== "operator") {
    throw new Error("Unauthorized: Operator access required");
  }
}

async function resolveInvitation(
  workos: WorkOS,
  email: string,
  storedInvitationId?: string,
): Promise<Invitation | null> {
  if (storedInvitationId) {
    try {
      return await workos.userManagement.getInvitation(storedInvitationId);
    } catch {
      // Stored id may be stale; fall back to listing by email.
    }
  }

  const list = await workos.userManagement.listInvitations({ email, limit: 10 });
  const invitations = await list.autoPagination();
  if (invitations.length === 0) {
    return null;
  }

  return [...invitations].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )[0]!;
}

function mapInvitationToStatus(invitation: Invitation): ClientAccessStatus {
  switch (invitation.state) {
    case "pending":
      return {
        kind: "pending",
        invitationId: invitation.id,
        expiresAt: invitation.expiresAt,
      };
    case "accepted":
      return {
        kind: "accepted",
        invitationId: invitation.id,
      };
    case "expired":
      return {
        kind: "expired",
        invitationId: invitation.id,
      };
    case "revoked":
      return { kind: "revoked" };
    default:
      return { kind: "none" };
  }
}

async function buildAccessStatus(ctx: ActionCtx, slug: string): Promise<ClientAccessStatus> {
  const client = await ctx.runQuery(internal.clients.getForInviteInternal, { slug });
  if (!client) {
    throw new Error("Client not found");
  }

  if (isOperatorEmail(client.contactEmail)) {
    return { kind: "none" };
  }

  const seat = await ctx.runQuery(internal.clients.getSeatUser, { clientId: client._id });
  if (seat) {
    return {
      kind: "connected",
      userName: seat.name,
      userEmail: seat.email,
    };
  }

  const workos = getWorkOSClient();
  const invitation = await resolveInvitation(
    workos,
    client.contactEmail,
    client.workosInvitationId,
  );
  if (!invitation) {
    return { kind: "none" };
  }

  return mapInvitationToStatus(invitation);
}

/** Send a WorkOS AuthKit invitation so the recipient can register (signup disabled). */
export const send = internalAction({
  args: {
    email: v.string(),
    inviterUserId: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const workos = getWorkOSClient();
    const invitation = await workos.userManagement.sendInvitation({
      email: args.email,
      ...(args.inviterUserId ? { inviterUserId: args.inviterUserId } : {}),
    });
    return invitation.id;
  },
});

/** Operator view of WorkOS invite / seat status for one Client. */
export const getAccessStatus = action({
  args: { slug: v.string() },
  returns: clientAccessStatusValidator,
  handler: async (ctx, args): Promise<ClientAccessStatus> => {
    await requireOperatorAction(ctx);
    return await buildAccessStatus(ctx, args.slug);
  },
});

/** Revoke a pending invitation when deleting a Client, if one exists. */
export const revokePendingIfNeeded = internalAction({
  args: {
    email: v.string(),
    workosInvitationId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const workos = getWorkOSClient();
    const invitation = await resolveInvitation(
      workos,
      args.email,
      args.workosInvitationId,
    );
    if (invitation?.state === "pending") {
      await workos.userManagement.revokeInvitation(invitation.id);
    }
    return null;
  },
});

/** Delete a WorkOS AuthKit user after Portal data is removed. */
export const deleteWorkosUser = internalAction({
  args: { authId: v.string() },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const workos = getWorkOSClient();
    await workos.userManagement.deleteUser(args.authId);
    return null;
  },
});

/** Revoke a pending WorkOS invitation for one Client. */
export const revoke = action({
  args: { slug: v.string() },
  returns: clientAccessStatusValidator,
  handler: async (ctx, args): Promise<ClientAccessStatus> => {
    await requireOperatorAction(ctx);

    const client = await ctx.runQuery(internal.clients.getForInviteInternal, {
      slug: args.slug,
    });
    if (!client) {
      throw new Error("Client not found");
    }

    const workos = getWorkOSClient();
    const invitation = await resolveInvitation(
      workos,
      client.contactEmail,
      client.workosInvitationId,
    );

    if (!invitation) {
      throw new Error("Aucune invitation à révoquer");
    }
    if (invitation.state !== "pending") {
      throw new Error("Seule une invitation en attente peut être révoquée");
    }

    await workos.userManagement.revokeInvitation(invitation.id);
    return { kind: "revoked" };
  },
});
