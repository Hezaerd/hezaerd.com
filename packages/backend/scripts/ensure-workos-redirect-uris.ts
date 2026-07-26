/**
 * Registers WorkOS redirect URIs + CORS origins for the current API key.
 * Safe to run on every Vercel portal build.
 *
 * Skips when credentials are missing (local builds without WorkOS).
 */

type RedirectUri = {
  object: "redirect_uri";
  id: string;
  uri: string;
};

type CorsOrigin = {
  object: "cors_origin";
  id: string;
  origin: string;
};

type ListResponse<T> = {
  object: "list";
  data: T[];
  list_metadata?: { before?: string | null; after?: string | null };
};

const REDIRECT_API = "https://api.workos.com/user_management/redirect_uris";
const CORS_API = "https://api.workos.com/user_management/cors_origins";

function collectDesired(): { redirectUris: string[]; corsOrigins: string[] } {
  const redirectUris = new Set<string>();
  const corsOrigins = new Set<string>();

  const redirect = process.env["WORKOS_REDIRECT_URI"]?.trim();
  if (redirect) {
    redirectUris.add(redirect);
    try {
      corsOrigins.add(new URL(redirect).origin);
    } catch {
      // ignore malformed
    }
  }

  const siteUrl = process.env["VITE_SITE_URL"]?.trim().replace(/\/$/, "");
  if (siteUrl) {
    redirectUris.add(`${siteUrl}/api/auth/callback`);
    corsOrigins.add(siteUrl);
  }

  return { redirectUris: [...redirectUris], corsOrigins: [...corsOrigins] };
}

async function listAll<T extends { id: string }>(
  apiKey: string,
  endpoint: string,
): Promise<T[]> {
  const out: T[] = [];
  let after: string | undefined;

  for (;;) {
    const url = new URL(endpoint);
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`list ${endpoint} failed: ${res.status} ${await res.text()}`);
    }

    const body = (await res.json()) as ListResponse<T>;
    out.push(...body.data);
    const next = body.list_metadata?.after;
    if (!next) break;
    after = next;
  }

  return out;
}

async function createResource(
  apiKey: string,
  endpoint: string,
  body: Record<string, string>,
  label: string,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    console.log(`workos: registered ${label}`);
    return;
  }

  const text = await res.text();
  if (res.status === 400 || res.status === 409) {
    console.log(`workos: ${label} already present or rejected (${res.status})`);
    console.log(text);
    return;
  }

  throw new Error(`create ${label} failed: ${res.status} ${text}`);
}

async function main(): Promise<void> {
  const apiKey = process.env["WORKOS_API_KEY"]?.trim();
  const { redirectUris, corsOrigins } = collectDesired();

  if (!apiKey || redirectUris.length === 0) {
    console.log("workos: skip ensure-redirect-uris (missing WORKOS_API_KEY or redirect URI)");
    return;
  }

  const existingRedirects = await listAll<RedirectUri>(apiKey, REDIRECT_API);
  const haveRedirect = new Set(existingRedirects.map((r) => r.uri));

  for (const uri of redirectUris) {
    if (haveRedirect.has(uri)) {
      console.log(`workos: redirect URI already registered ${uri}`);
      continue;
    }
    await createResource(apiKey, REDIRECT_API, { uri }, `redirect URI ${uri}`);
  }

  const existingCors = await listAll<CorsOrigin>(apiKey, CORS_API);
  const haveCors = new Set(existingCors.map((c) => c.origin));

  for (const origin of corsOrigins) {
    if (haveCors.has(origin)) {
      console.log(`workos: CORS origin already registered ${origin}`);
      continue;
    }
    await createResource(apiKey, CORS_API, { origin }, `CORS origin ${origin}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
