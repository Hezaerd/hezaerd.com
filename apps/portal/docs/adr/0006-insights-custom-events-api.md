# Insights — custom events API & taxonomy

Custom events are **generic and name-free**: any valid event name works per client, with optional Operator labels for the Insights UI. Events are **ingested only when `features.insights` is true** for that client; baseline pageview collection is unchanged.

**Status:** accepted (revised — SDK surface)

## SDK surface

### Client (browser)

```tsx
import { useTrack } from "@hezaerd/analytics/react";

function QuoteForm() {
  const track = useTrack();
  return <button onClick={() => track("quote_submit")}>Envoyer</button>;
}
```

```tsx
import { track } from "@hezaerd/analytics";

track("phone_click");
```

Declarative (delegated listener installed by `init` / `<HezaerdAnalytics />`):

```html
<a href="tel:+15145551234" data-hezaerd-event="phone_click">Appeler</a>
```

### Server (Node, server actions, route handlers)

```ts
import { track } from "@hezaerd/analytics/server";

await track("contact_submit", { path: "/api/contact" });
```

Requires env: `HEZAERD_SITE_KEY`, `HEZAERD_INGEST_SECRET`, optional `HEZAERD_ANALYTICS_URL`.

## Payload shapes

**Browser** → `POST /analytics/collect`:

```json
{ "siteKey": "…", "path": "/contact", "event": "phone_click" }
```

**Server** → `POST /analytics/collect/server` + `Authorization: Bearer {ingestSecret}`:

```json
{ "siteKey": "…", "path": "/api/contact", "event": "contact_submit" }
```

Pageviews are browser-only (omit `event`). Server ingest is **events only** — no pageviews, sessions, or visitor hash.

## Event name rules

| Rule | Value |
|------|--------|
| Pattern | `^[a-z][a-z0-9_]{2,63}$` |
| Reserved | `pageview`, names prefixed `_` |
| Invalid names | Dropped silently (still `204`) — no SDK throw in prod |
| Props | **None in v1** — no second argument beyond optional server `path` |

Names are **not whitelisted**. Operators may pre-label names before first fire.

## Operator labels

Stored on `clients.insightsEventLabels: Record<string, string>`.

- Edited from Client Desk (Statistiques section): event name → display label
- UI shows **label** if set, else humanized name (`phone_click` → « Phone click »)
- Labels are cosmetic; rollups key on canonical `eventName`

## Display (Insights UI)

Over the selected period (7 / 30 / 90 days or today):

- Table sorted by `count` desc
- **Top 20** named rows
- Remaining volume summed as **« Autres »** (single row, not expandable in v1)

## Suggested conventions (documentation only)

Not enforced by Portal — copy into per-client repo README / handoff:

| Event | Typical use |
|-------|-------------|
| `phone_click` | `tel:` link |
| `email_click` | `mailto:` link |
| `contact_submit` | Contact form success |
| `quote_submit` | Quote / devis form |
| `booking_click` | External booking CTA |
| `directions_click` | Maps / directions link |

## v1 non-goals

- Event properties / dimensions
- Operator-defined required catalogue before tracking works
- Client-side debug mode in production builds
