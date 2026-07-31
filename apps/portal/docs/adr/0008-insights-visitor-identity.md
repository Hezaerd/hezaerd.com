# Insights — visitor identity & unique counts

How visitors are counted without cookies or stored PII.

**Status:** accepted

## Visitor hash (per hit)

```
visitorHash = HMAC-SHA256(
  ANALYTICS_HASH_SECRET,
  siteKey + "|" + dayKey + "|" + truncatedIp + "|" + userAgent
)
```

| Input | Rule |
|-------|------|
| `ANALYTICS_HASH_SECRET` | Convex env, rotate only with ops plan |
| `dayKey` | `America/Montreal` date — natural daily salt |
| `truncatedIp` | IPv4 /24, IPv6 /48 — discarded after hash |
| `userAgent` | Raw string in HMAC input only, never persisted |

No cookies. No `localStorage`. Aligns with privacy research (#22).

## Unique visitors

- **Within a day:** first `visitorHash` unseen for `(clientId, dayKey)` → increment `analyticsDailyTotals.visitors`.
- **Across a period (7/30/90j):** **sum of daily `visitors`** — not cross-day deduplication. UI copy: « Visiteurs (estimation) » to set expectations.
- **Today:** same rule on partial day; refreshes with pseudo realtime.

## Quebec (Loi 25)

Privacy research recommends conservative opt-in for QC clients when identification tech is arguable. **v1 product:** Operator note on Client Desk; optional « Exiger consentement analytics » flag per client → snippet no-ops until consent callback *(implementation ticket, not blocking spec)*. Default for QC clients: document in handoff; beacon stays cookieless.

## Bot exclusion

Drop hits matching basic bot UA substrings before hashing (empty user-agent, `bot`, `spider`, `crawl`, `preview`, etc.).

## Non-goals v1

- Cross-device identity
- Cross-day unique visitors
- Fingerprint beyond IP+UA hash
