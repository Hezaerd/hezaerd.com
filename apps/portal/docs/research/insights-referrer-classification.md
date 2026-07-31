# Portal Insights — Referrer classification & SEO signals

**Wayfinder #25 · Research note · 2026-07-31**

Scope: first-party beacon sends `referrer` (from `document.referrer` at hit time) + current page URL may carry UTM params. Server derives `sourceKind` for `analyticsDailySources` rollups. Aligns with ADR-0005 enum: `google` · `direct` · `social` · `referral` · `email` · `other`.

Sources: [Google Analytics UTM parameters](https://support.google.com/analytics/answer/10917952), [Plausible referrer logic](https://plausible.io/docs/top-referrers), [Matomo campaign tracking](https://developer.matomo.org/guides/tracking-campaigns), [Fathom UTM handling](https://usefathom.com/docs/features/utm-parameters).

---

## Executive summary

Classify each pageview **server-side** in priority order: **UTM medium → UTM source → referrer hostname → direct**. For v1, store only `sourceKind` (six buckets). The Insights « Sources » chart groups by kind; no per-domain drill-down until v2.

**SEO signals that matter for local SMB clients** (derivable from v1 data):

| Signal | Source |
|--------|--------|
| Search vs direct mix | `google` vs `direct` share |
| Which pages search lands on | `analyticsDailyPages.entries` filtered by sessions where first hit `sourceKind=google` *(approximation v1: attribute source at each pageview — good enough for top landing pages overall)* |
| Referral from directories / partners | `referral` bucket volume trend |
| Paid / email campaigns tagged | UTM → `email` or `google` with campaign note in Operator doc, not in product v1 |

Google Search Console integration remains out of scope (queries, impressions, position).

---

## Classification algorithm (v1)

Input: `referrer?: string` (full URL or empty), page URL query string for UTMs.

Normalize: lowercase hostnames; strip `www.`.

### Step 1 — UTM medium (page URL query)

| `utm_medium` (contains) | → `sourceKind` |
|-------------------------|----------------|
| `email`, `newsletter`, `mail` | `email` |
| `social`, `social-media` | `social` |
| `cpc`, `ppc`, `paid`, `paidsearch` | continue to step 2 (source disambiguation) |

### Step 2 — UTM source

| `utm_source` (contains) | → `sourceKind` |
|-------------------------|----------------|
| `google`, `gmb`, `google_my_business` | `google` |
| `facebook`, `fb`, `instagram`, `ig`, `twitter`, `x`, `tiktok`, `linkedin`, `pinterest`, `youtube` | `social` |
| `newsletter`, `mailchimp`, `sendgrid` | `email` |
| non-empty, no match above | `referral` (treat as named campaign / partner) |

### Step 3 — Referrer hostname

Empty or same-site referrer → `direct` **unless** step 1–2 already set a kind.

| Host matches | → `sourceKind` |
|--------------|----------------|
| `google.*`, `google.com`, `com.google.android.googlequicksearchbox` | `google` |
| `bing.com`, `duckduckgo.com`, `search.yahoo.com`, `ecosia.org`, `qwant.com`, `yahoo.com` | `google` *(UI label: « Search » — all search engines one bucket v1)* |
| `facebook.com`, `l.facebook.com`, `lm.facebook.com`, `instagram.com`, `twitter.com`, `x.com`, `t.co`, `tiktok.com`, `linkedin.com`, `lnkd.in`, `pinterest.com`, `youtube.com`, `reddit.com` | `social` |
| any other external host | `referral` |

### Step 4 — Default

No referrer, no UTM → `direct`.

### Internal / invalid

- Referrer host === site host → ignore for source (treat as same-session navigation); do not increment sources on internal-only hits unless it's the session entry (use session's **first external** source for the visit — **v1 simplification**: classify each pageview independently; entry pages chart still useful, search attribution slightly overstated on multi-page — acceptable at this volume).

---

## SEO-oriented Operator reading (no extra product UI v1)

1. **Search share rising?** — `google` / total over 30d.
2. **Best landing pages** — `entries` desc on `analyticsDailyPages`.
3. **Contact path weak?** — routes to `/contact` vs entries on service pages.
4. **Directory referrals** — spike in `referral` after listing on Yelp, Pages Jaunes, etc. (cannot distinguish without v2 hostname detail).

---

## v2 candidates (fog)

- Store `sourceDetail` (referrer hostname or `utm_source`) for top-N breakdown inside `referral` / `social`.
- Session-level source attribution (first touch only).
- GSC API for query keywords.
