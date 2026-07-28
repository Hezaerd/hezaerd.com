import { httpRouter } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import type Stripe from "stripe";

import { httpAction } from "./_generated/server";
import { internal, components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { authKit } from "./auth";
import { extractBearerToken, hashDeployToken } from "./lib/deployToken";
import { verifyGithubWebhookSignature } from "./lib/githubApp";
import { normalizeGithubRepo } from "./lib/sites";

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

http.route({
  path: "/site/deploy",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const token =
      extractBearerToken(request.headers.get("Authorization")) ??
      request.headers.get("X-Portal-Deploy-Token");
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: {
      status?: string;
      commitSha?: string;
      previewUrl?: string;
      finishedAt?: number;
    };
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const status = body.status;
    if (status !== "success" && status !== "failure" && status !== "in_progress") {
      return new Response("Invalid status", { status: 400 });
    }

    const tokenHash = await hashDeployToken(token);
    const clientId = await ctx.runQuery(internal.sitesInternal.getClientByDeployTokenHash, {
      tokenHash,
    });
    if (!clientId) {
      return new Response("Unauthorized", { status: 401 });
    }

    await ctx.runMutation(internal.sitesInternal.setDeploySnapshot, {
      clientId,
      deploy: {
        status,
        commitSha: body.commitSha,
        previewUrl: body.previewUrl,
        finishedAt: body.finishedAt ?? Date.now(),
        reportedAt: Date.now(),
      },
    });

    return new Response(null, { status: 204 });
  }),
});

http.route({
  path: "/site/github-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const signature = request.headers.get("X-Hub-Signature-256");
    const event = request.headers.get("X-GitHub-Event");

    const valid = await verifyGithubWebhookSignature({
      payload,
      signatureHeader: signature,
    });
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (event === "ping") {
      return new Response("pong", { status: 200 });
    }

    if (event !== "push") {
      return new Response(null, { status: 204 });
    }

    let json: {
      ref?: string;
      forced?: boolean;
      repository?: { full_name?: string };
      commits?: Array<{
        id: string;
        message: string;
        timestamp: string;
        author: { name: string };
        url: string;
      }>;
    };
    try {
      json = JSON.parse(payload);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const fullName = json.repository?.full_name;
    const ref = json.ref;
    if (!fullName || !ref?.startsWith("refs/heads/")) {
      return new Response(null, { status: 204 });
    }

    const branch = ref.slice("refs/heads/".length);
    const githubRepo = normalizeGithubRepo(fullName);

    if (json.forced || !json.commits?.length) {
      await ctx.scheduler.runAfter(0, internal.sitesInternal.syncGitFromPush, {
        githubRepo,
        branch,
        forced: Boolean(json.forced),
      });
      return new Response(null, { status: 204 });
    }

    const client = await ctx.runQuery(internal.sitesInternal.getClientByGithubRepo, {
      githubRepo,
    });
    if (!client || client.linkedSite.defaultBranch !== branch) {
      return new Response(null, { status: 204 });
    }

    await ctx.runMutation(internal.sitesInternal.mapPushCommits, {
      clientId: client._id,
      branch,
      commits: json.commits.map((commit) => ({
        id: commit.id,
        message: commit.message,
        authorName: commit.author.name,
        timestamp: Date.parse(commit.timestamp),
        url: commit.url,
      })),
    });

    return new Response(null, { status: 204 });
  }),
});

export default http;

