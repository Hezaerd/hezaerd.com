import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }
  return request.headers.get("x-real-ip")?.trim() ?? "";
}

function parseBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

function corsHeaders(origin: string | null, allowed: boolean): Record<string, string> {
  if (!origin || !allowed) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

async function isCollectCorsAllowed(
  runQuery: Function,
  origin: string | null,
  siteKey?: string,
): Promise<boolean> {
  if (!origin) {
    return false;
  }

  if (siteKey) {
    return runQuery(internal.analyticsSites.isOriginAllowedForSiteKey, {
      siteKey,
      origin,
    });
  }

  return runQuery(internal.analyticsSites.isKnownOrigin, { origin });
}

async function handleCollectPost(
  ctx: { runMutation: Function; runQuery: Function },
  request: Request,
): Promise<Response> {
  const origin = request.headers.get("origin");
  let body: {
    siteKey?: string;
    path?: string;
    referrer?: string;
    event?: string;
  };

  try {
    body = await request.json();
  } catch {
    const allowed = await isCollectCorsAllowed(ctx.runQuery, origin);
    return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
  }

  const allowed = await isCollectCorsAllowed(ctx.runQuery, origin, body.siteKey);

  if (!body.siteKey || !body.path) {
    return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
  }

  await ctx.runMutation(internal.analyticsCollect.ingest, {
    siteKey: body.siteKey,
    path: body.path,
    referrer: body.referrer,
    event: body.event,
    userAgent: request.headers.get("user-agent") ?? "",
    origin: origin ?? undefined,
    refererHeader: request.headers.get("referer") ?? undefined,
    ip: getClientIp(request),
  });

  return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
}

async function handleCollectServerPost(
  ctx: { runMutation: Function },
  request: Request,
): Promise<Response> {
  const ingestSecret = parseBearerToken(request);
  if (!ingestSecret) {
    return new Response(null, { status: 204 });
  }

  let body: {
    siteKey?: string;
    path?: string;
    event?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  if (!body.siteKey || !body.event) {
    return new Response(null, { status: 204 });
  }

  await ctx.runMutation(internal.analyticsCollect.ingestServer, {
    siteKey: body.siteKey,
    ingestSecret,
    event: body.event,
    path: body.path,
  });

  return new Response(null, { status: 204 });
}

export const collectPost = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }
  return handleCollectPost(ctx, request);
});

export const collectServerPost = httpAction(async (ctx, request) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 405 });
  }
  return handleCollectServerPost(ctx, request);
});

export const collectOptions = httpAction(async (ctx, request) => {
  const origin = request.headers.get("origin");
  const allowed = await isCollectCorsAllowed(ctx.runQuery, origin);

  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin, allowed),
      "Access-Control-Max-Age": "86400",
    },
  });
});
