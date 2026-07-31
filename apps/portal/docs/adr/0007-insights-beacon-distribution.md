# Insights — SDK distribution & install

How client sites send analytics to Portal via `@hezaerd/analytics` on npm.

**Status:** accepted (revised — npm SDK primary)

## Product surface

Published npm package `@hezaerd/analytics` (public). Product name in Portal remains **Insights**.

| Export | Role |
|--------|------|
| `@hezaerd/analytics` | Core — `init`, `track` |
| `@hezaerd/analytics/react` | `<HezaerdAnalytics />`, `useTrack()` |
| `@hezaerd/analytics/server` | `track()` for Node / server actions |

Monorepo source: `packages/analytics`. Built with **tsdown** (ESM + CJS + `.d.ts`).

## Ingestion URL

Target (stable SDK default):

```
https://analytics.hezaerd.com/collect          ← browser (pageviews + client events)
https://analytics.hezaerd.com/collect/server   ← server events
```

Until custom domain is live (Convex free tier or Worker proxy), apps override via env:

```env
NEXT_PUBLIC_HEZAERD_ANALYTICS_URL=https://{CONVEX_SITE_URL}/analytics/collect
HEZAERD_ANALYTICS_URL=https://{CONVEX_SITE_URL}/analytics/collect/server
```

Same Convex deployment as Portal backend. Worker CNAME on `analytics.hezaerd.com` → Convex is the v1 infra path without Convex paid custom domains.

## Install (primary)

```tsx
// app/layout.tsx
import { HezaerdAnalytics } from "@hezaerd/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <HezaerdAnalytics
          siteKey={process.env.NEXT_PUBLIC_HEZAERD_SITE_KEY!}
          endpoint={process.env.NEXT_PUBLIC_HEZAERD_ANALYTICS_URL}
        />
      </body>
    </html>
  );
}
```

Desk Statistiques shows: `siteKey`, `ingestSecret` (server only, copy once), env template, and npm install line when `linkedSite` exists.

## Credentials lifecycle

1. Operator saves `linkedSite` → generate `siteKey` (public) + `ingestSecret` (private).
2. Upsert `analyticsSites` row `{ clientId, siteKey, ingestSecret, productionUrl }`.
3. **Regénérer les clés** (Operator): rotates both `siteKey` and `ingestSecret`; client updates env + redeploy.

| Credential | Exposure | Auth |
|------------|----------|------|
| `siteKey` | Public — bundle / `NEXT_PUBLIC_*` | Browser ingest + Origin check |
| `ingestSecret` | Server only — `HEZAERD_INGEST_SECRET` | Bearer token on `/collect/server` |

## Install channels

| Channel | When |
|---------|------|
| **npm + env** | Default — managed React/Next/TanStack/Astro repos |
| **Managed repo PR** | `linkedSite.githubRepo` set — add dep + layout in setup PR |

## Client behaviour (SDK)

- `<HezaerdAnalytics />` → `init({ siteKey, endpoint })` on mount (client-only).
- Pageview on init: `{ siteKey, path, referrer }`.
- **SPA**: patch `history.pushState` / `replaceState` + `popstate`.
- `useTrack()` / `track()` → custom events (ADR-0006).
- `sendBeacon` + `fetch` fallback; no cookies, no localStorage.

## Validation (browser)

`POST /analytics/collect` — `Origin` / `Referer` host must match `analyticsSites.productionUrl`. Wrong origin → `204` (no leak). Dynamic CORS `Access-Control-Allow-Origin` when allowed.

## Validation (server)

`POST /analytics/collect/server` — `Authorization: Bearer {ingestSecret}` must match the row for `siteKey`. No Origin check. Events only.

## Non-goals v1

- Per-client CNAME (`analytics.client.com`)
- GTM / Zaraz template
- WordPress plugin
- Legacy `<script src="…/a.js">` (removed — npm only)
