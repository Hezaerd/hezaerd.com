# Insights — custom events API & taxonomy

Custom events are **generic and name-free**: any valid event name works per client, with optional Operator labels for the Insights UI. Events are **ingested only when `features.insights` is true** for that client; baseline pageview collection is unchanged.

**Status:** accepted

## Snippet surface

Global on the client site after the beacon loads:

```js
hezaerd.track("phone_click");
```

Declarative clicks (delegated listener on `document`):

```html
<a href="tel:+15145551234" data-hezaerd-event="phone_click">Appeler</a>
<button type="submit" data-hezaerd-event="quote_submit">Envoyer</button>
```

Both paths send the same payload shape to `POST /analytics/collect`:

```json
{ "siteKey": "…", "path": "/contact", "event": "phone_click" }
```

Pageviews omit `event`. Custom events omit navigation side-effects beyond the current `path` for context.

## Event name rules

| Rule | Value |
|------|--------|
| Pattern | `^[a-z][a-z0-9_]{2,63}$` |
| Reserved | `pageview`, names prefixed `_` |
| Invalid names | Dropped silently (still `204`) — no beacon errors in prod |
| Props | **None in v1** — no second argument to `track()` |

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
- Client-side event preview or debug mode in production snippet
