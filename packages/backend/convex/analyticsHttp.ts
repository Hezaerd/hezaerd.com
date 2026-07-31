import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const NO_CONTENT = new Response(null, { status: 204 });

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }
  return request.headers.get("x-real-ip")?.trim() ?? "";
}

async function handleCollectPost(ctx: { runMutation: Function }, request: Request): Promise<Response> {
  let body: {
    siteKey?: string;
    path?: string;
    referrer?: string;
    event?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NO_CONTENT;
  }

  if (!body.siteKey || !body.path) {
    return NO_CONTENT;
  }

  await ctx.runMutation(internal.analyticsCollect.ingest, {
    siteKey: body.siteKey,
    path: body.path,
    referrer: body.referrer,
    event: body.event,
    userAgent: request.headers.get("user-agent") ?? "",
    origin: request.headers.get("origin") ?? undefined,
    refererHeader: request.headers.get("referer") ?? undefined,
    ip: getClientIp(request),
  });

  return NO_CONTENT;
}

export const collectPost = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }
  return handleCollectPost(ctx, request);
});

export const collectOptions = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
});
