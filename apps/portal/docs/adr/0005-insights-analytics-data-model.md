# Insights analytics — Convex rollups + sessions éphémères

Portal Insights v1 ingests pageviews and (when client access is on) custom events via a Convex HTTP endpoint. The dashboard never queries raw events: each hit increments daily rollups at write time. Navigation signals (landings, exits, 2–3 page routes) need short-lived session state keyed by a daily visitor hash — no cookies, no raw IP retention (see `apps/portal/docs/research/insights-privacy-consent-beacon.md`).

**Status:** accepted

## Schema

### Registry

`analyticsSites` — one row per client with a linked site.

| Field | Role |
|-------|------|
| `clientId` | Owner |
| `siteKey` | Public beacon key (lookup index) |
| `productionUrl` | Denormalized for Origin validation |

Index: `by_siteKey`, `by_clientId`.

Extend `clients` with optional `insightsEventLabels: Record<eventName, displayLabel>` for Operator-facing labels (UI only).

### Daily rollups (permanent)

All use `dayKey: string` — calendar date in `America/Montreal` (`YYYY-MM-DD`). v2 may add per-site timezone on `linkedSite`.

| Table | Grain | Fields incremented |
|-------|-------|-------------------|
| `analyticsDailyTotals` | client + day | `pageviews`, `visitors` |
| `analyticsDailyPages` | client + day + path | `views`, `entries`, `exits` |
| `analyticsDailySources` | client + day + `sourceKind` | `views` |
| `analyticsDailyRoutes` | client + day + `routeKey` | `views` |
| `analyticsDailyEvents` | client + day + `eventName` | `count` |

Index each: `by_clientId_and_dayKey`.

**`sourceKind` enum:** `google` · `direct` · `social` · `referral` · `email` · `other` — derived at ingest from referrer hostname + UTM (`utm_medium=email` → `email`; `utm_source=google` + paid tags still → `google` bucket for v1 simplicity).

**`routeKey` format:** `/ → /services → /contact` (2–3 segments, normalized paths).

### Ephemeral (privacy + navigation)

| Table | Purpose | TTL |
|-------|---------|-----|
| `analyticsVisitorDays` | First-seen visitor hash per client+day → unique count | Cron: delete rows where `dayKey < today - 2` |
| `analyticsSessions` | Active visit: `paths[]`, `firstPath`, `lastPath`, `lastSeenAt` | Cron: delete when `lastSeenAt` older than 30 min |

Session rules: same `visitorHash` + gap ≤ 30 min → append path (dedupe consecutive duplicates). New session → increment `entries` on first path; previous session's `lastPath` → increment `exits`; when `paths.length` hits 2 or 3 → increment matching `routeKey`.

**Visitor hash:** `HMAC-SHA256(serverSecret, siteKey + dayKey + truncatedIp + userAgent)` — truncated IP (/24 IPv4, /48 IPv6), never stored.

## Ingest (`POST /analytics/collect`)

Payload: `{ siteKey, path, referrer?, event? }`.

1. Resolve `analyticsSites` by `siteKey`; validate `Origin`/`Referer` host against `productionUrl`.
2. Reject bots (basic UA list).
3. If `event` present: require `clients.features.insights === true`; increment `analyticsDailyEvents` only.
4. Else pageview: compute hash → upsert visitor day (new → `visitors++`) → update session → increment totals, pages, sources, routes as above.
5. Return `204` immediately.

## Read paths (Portal queries)

| UI block | Query |
|----------|-------|
| Trafic (today / 7 / 30 / 90) | `analyticsDailyTotals` range on `dayKey` |
| Sources | Sum `analyticsDailySources` by `sourceKind` over range |
| Top pages | `analyticsDailyPages` order `views` desc |
| Landings / exits | order `entries` / `exits` desc |
| Routes | `analyticsDailyRoutes` order `views` desc, limit 5 |
| Events | `analyticsDailyEvents` order `count` desc, top 20 |

“Today” pseudo realtime = same daily row for current `dayKey`; client refetch ~15 min.

## Retention

- Rollups: 25 months (CNIL-aligned cap), cron purge older.
- Ephemeral tables: as above.
- No raw event log in v1.

## Considered options

- **Raw events + batch rollup:** simpler ingest, heavier reads and storage — rejected for Convex dashboard pattern.
- **Pairwise transitions only:** cheaper but worse 3-step routes — rejected; session table is small at this volume.
