# Insights — beacon distribution & install

How the tracking snippet reaches client sites and talks to Convex.

**Status:** accepted

## Artifact

Monorepo package `packages/analytics` (`@hezaerd/analytics`) — TypeScript → esbuild **IIFE** (~2 KB gzip target). Product-facing name remains **Insights** in Portal; this package is the site-side collector only.

Served at:

```
GET https://{CONVEX_SITE_URL}/analytics/a.js
```

Same deployment as `POST /analytics/collect`. `CONVEX_SITE_URL` is already env-configured per environment (dev/prod).

## Snippet (copy from Client Desk)

```html
<script
  defer
  src="https://{CONVEX_SITE_URL}/analytics/a.js"
  data-site-key="{siteKey}"
></script>
```

Desk Statistiques shows the filled snippet + copy button when `linkedSite` exists.

## siteKey lifecycle

1. Operator saves `linkedSite` on a client → generate `siteKey` (crypto random, URL-safe).
2. Upsert `analyticsSites` row `{ clientId, siteKey, productionUrl }`.
3. Rotating key: Operator action « Regénérer la clé » invalidates old key (rare; re-copy snippet).

## Install channels

| Channel | When |
|---------|------|
| **Desk copy-paste** | Default — Operator pastes into client site `<head>` or layout |
| **Managed repo** | When `linkedSite.githubRepo` is set and you maintain the repo — add snippet in root layout via PR as part of site setup checklist (Portal shows diff hint, no auto-PR v1) |

No npm package for clients v1 — unnecessary surface for SMB sites.

## Beacon behaviour (v1)

- On load: send pageview `{ siteKey, path, referrer: document.referrer }`.
- **SPA**: patch `history.pushState` / `replaceState` + `popstate` → pageview on path change (same payload).
- **Events**: `hezaerd.track(name)` + delegated `click` on `[data-hezaerd-event]` (ADR-0006).
- `sendBeacon` with `fetch` fallback; always async, non-blocking.
- No cookies, no localStorage.

## Validation

- Collect endpoint validates `Origin` / `Referer` host against `analyticsSites.productionUrl`.
- Wrong origin → 204 (no leak).

## Non-goals v1

- First-party CNAME (`analytics.client.com`)
- Auto-inject via Cloudflare Zaraz / GTM template
- WordPress plugin
