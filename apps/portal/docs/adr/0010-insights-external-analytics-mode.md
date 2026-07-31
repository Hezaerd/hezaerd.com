# Insights — external analytics mode (GA4)

Coexistence of Portal baseline collection with clients who prefer Google Analytics.

**Status:** accepted

## Model

| Layer | Behaviour |
|-------|-----------|
| **Portal baseline** | Always on for `linkedSite` — Operator Desk always has stats |
| **Client GA4** | Client (or Operator) adds `gtag` on their site independently — Portal does not inject GA4 |
| **`features.insights`** | Gates Client Workspace Area only |

## Optional Operator metadata

On `linkedSite` (or client settings):

```ts
externalAnalytics?: {
  provider: "ga4";
  measurementId?: string; // G-XXXXXXXX — note for Operator, not validated
}
```

Purely documentary v1 — helps you remember what's on the site. No API sync.

## Client Workspace when GA4-only preference

If Operator **does not** enable `features.insights` and set `externalAnalytics`:

- Client does not see Statistiques Area (existing Feature gate).
- No Portal messaging to Client — GA4 is outside Portal.

If Operator enables `features.insights` **and** client also runs GA4:

- **Double tagging allowed** — Portal baseline + GA4 in parallel; explain in handoff that numbers will differ.

If Operator wants Client to use GA4 **instead of** Portal UI:

- Keep `features.insights` **off**; document GA4 access in off-Portal handoff. Operator still sees Portal stats on Desk.

## Non-goals

- GA4 Data API / Looker embed in Portal
- Automatic GA4 snippet injection from Portal
- Reconciling metrics between Portal and GA4
