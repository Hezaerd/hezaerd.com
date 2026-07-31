# Portal Insights — Privacy, consent & cookieless first-party beacon

**Wayfinder #22 · Research note · 2026-07-31**

Scope: local business websites in France, Canada (federal), and Quebec — first-party analytics beacon with **no third-party cookies**, **server-side visitor hash**, **no PII stored**. Practical framing for Portal Insights (solo builder, SMB clients).

---

## Executive summary

**Short answer:** A well-designed cookieless first-party beacon *often does not require a consent banner* in **France/EU** for the **ePrivacy / Art. 82 Loi Informatique et Libertés** layer — because that law targets read/write on the **terminal equipment**, not server-side processing of HTTP metadata. You still owe **GDPR** transparency and a lawful basis (typically **legitimate interest** + documented LIA). **Quebec (Loi 25)** is the strictest cell: if the stack is treated as a technology with **identification** or **profiling** functions, **Art. 8.1** pushes you toward **express opt-in before the beacon fires**, even without cookies. **Federal Canada (PIPEDA)** has no cookie-specific statute like ePrivacy, but **meaningful consent** still applies when you collect **personal information** (IP addresses qualify); a privacy-policy-first approach can work for low-risk, first-party, aggregate analytics, but express consent is safer when in doubt.

| Jurisdiction | Consent banner for cookieless first-party beacon? | Primary legal hooks |
|---|---|---|
| France / EU | **Usually no** (ePrivacy), if zero terminal storage/access | Art. 82 LIL, ePrivacy Art. 5(3), GDPR Art. 6 |
| Canada (federal) | **Often no banner** if implied consent + strong privacy policy; **express safer** | PIPEDA Principle 3, OPC meaningful-consent guidance |
| Quebec | **Higher risk without banner** — treat as opt-in unless counsel agrees otherwise | LP Art. 8, 8.1; CAI consent guidelines 2023-1 |

**Unique visitors:** Industry pattern (Plausible, Fathom) — `hash(daily_salt + site + ip + user_agent)`, salt rotated ≤24h, **no raw IP/UA retention** — counts uniques **within a day only**, not across days/devices. That aligns with CNIL anti-cross-site rules and minimizes Loi 25 “identification” exposure, but does not eliminate GDPR/QC analysis entirely.

---

## France — CNIL, RGPD, ePrivacy

### Two layers (do not conflate)

1. **ePrivacy / Art. 82 LIL** (transposition of ePrivacy Directive Art. 5(3)): consent **before** storing or accessing information on the user’s **terminal equipment** (cookies, localStorage, fingerprinting from the device, etc.). Applies **even when data are not personal** (CNIL délib. 2020-091, §§13–14).
2. **GDPR**: applies when processing **personal data** (IP, online identifiers, hashes derived from them). Requires a **legal basis** (Art. 6) plus transparency (Arts. 13–14), rights, etc.

Cookieless server-side analytics that **never reads or writes the terminal** sits **outside layer 1**. Layer 2 still applies.

### When cookies/trackers *are* used — CNIL audience-measurement exemption

If the tool **does** deposit or read traceurs, CNIL allows an **exemption from consent** only when **all** cumulative conditions are met (délib. 2020-091, Art. 5 §§50–51; fiche n°16; page mesure d’audience July 2025):

- Finality strictly limited to **audience measurement** for the **publisher’s exclusive account** (performance, navigation issues, ergonomics, server sizing, content analysis — not marketing).
- **Anonymous statistics only**; no cross-site tracking; no combining with other processing; **no transfer to third parties** for their own purposes.
- User **information** about trackers; **opt-out** mechanism (exemption covers prior consent, not transparency or opposition).
- Lifecycle caps: CNIL recommends **≤13 months** tracker lifetime, **≤25 months** retention (2025 self-assessment tool).

Since **July 2025**, CNIL replaced its pre-approval list with a **provider self-assessment** (14 criteria / 5 objectives). Providers document compliance; **no “CNIL certified” label**. Publishers remain liable on audit ([CNIL mesure d’audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)).

### Cookieless path (relevant to Portal Insights)

Vendors in the same architectural class (Plausible, Fathom) argue — with legal review — that:

- No cookies, localStorage, or device-resident identifiers → **Art. 5(3) ePrivacy not triggered** ([Fathom ePrivacy compliance](https://usefathom.com/legal/compliance/eprivacy-compliant-website-analytics)).
- IP is assigned by the ISP and sent in the HTTP request; UA is sent by the browser — **not “information stored in terminal equipment”** in the fingerprinting sense CNIL lists in §13.
- GDPR processing remains; **legitimate interest** (Art. 6(1)(f)) for aggregate reach measurement is the usual basis, with a **Legitimate Interest Assessment (LIA)** on file.

**CNIL has not published a dedicated “cookieless beacon” decision**, but its cookie guidelines scope confirms the trigger is **terminal read/write**, not all server-side logging.

### Practical FR checklist (cookieless beacon)

- [ ] First-party endpoint (same site or CNAME); no third-party script domain that sets cookies.
- [ ] No `document.cookie`, `localStorage`, `sessionStorage`, canvas/WebGL fingerprinting.
- [ ] Server-side daily hash; **delete salt + never store raw IP/UA**.
- [ ] Single-site scope; no cross-client / cross-site graph for Portal operator.
- [ ] Privacy policy / mentions légales: analytics purpose, data minimization, retention, DPO/contact, no ads/profiling.
- [ ] LIA documented (FR client = controller; Portal = processor).
- [ ] Optional: map configuration to CNIL 2025 self-assessment criteria as **supporting evidence** (even if no cookies — shows diligence).

---

## Canada (federal) — PIPEDA

### No ePrivacy equivalent

Federal law does **not** mirror EU “cookie consent” directly. Obligations flow from **PIPEDA Fair Information Principle 3 — Consent** and **meaningful consent** guidance (OPC + AB/BC commissioners, 2018).

### Personal information includes IP

Government and OPC materials treat **IP addresses as personal information** when linkable to an identifiable individual ([Treasury Board Web Analytics PIA](https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/privacy/web-analytics-privacy-impact-assessment-report.html)). A server-side hash derived from IP + UA is still processing PI **during computation**, even if not stored.

### OPC scope nuance — analytics vs OBA

OPC’s **online behavioural advertising** policy explicitly **does not apply** to “activities of a **single site** and its members/users” ([OPC OBA policy](https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/bg_ba_1206/)). First-party aggregate analytics for your own site is a different risk profile than cross-site OBA.

### Form of consent

OPC expects **express consent** when collection is **outside reasonable expectations**, involves **sensitive** data, or carries **meaningful residual risk of significant harm** ([PIPEDA Principle 3](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/)). **Implied consent** can suffice in narrow, low-risk, expected contexts if **clearly disclosed** in a privacy policy ([meaningful consent guidelines](https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/)).

For a **local SMB brochure site** with first-party, aggregate, cookieless stats:

- **Defensible without a banner:** privacy policy upfront disclosure, minimal data, no cross-site tracking, easy contact/opt-out — **if** analytics is reasonably expected for “how our site performs.”
- **Safer:** lightweight opt-in for analytics in provinces where clients want belt-and-braces compliance.

### Practical CA (non-QC) checklist

- [ ] Published privacy policy (purpose, categories, retention, third parties, contact).
- [ ] Contractual clarity: client = controller, Portal = processor (DPA).
- [ ] No sharing with ad networks; no secondary use.
- [ ] Document why implied consent is reasonable **or** implement opt-in.
- [ ] Be able to **demonstrate** consent choices if challenged (OPC accountability).

---

## Quebec — Loi 25 / CAI

### Stricter than PIPEDA

Loi 25 (LP) adds technology-specific rules beyond federal baseline.

### Art. 8.1 — identification, localization, profiling

When collecting PI via technology that includes functions to **identify**, **locate**, or **profile** a person, the organization must **inform beforehand** and provide means to **activate those functions voluntarily** — i.e. **off by default** ([LP Art. 8.1](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_LSP_Version_ADMIN.pdf); [CAI enterprise collection page](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises)).

**Profiling** (statutory definition): collecting and using PI to evaluate characteristics of a natural person, including **behavior** ([LP Art. 8.1](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_LSP_Version_ADMIN.pdf)).

CAI **Consent guidelines 2023-1** state technologies for identification/localization/profiling must be **disabled by default** — effectively **express consent** ([PDF](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_Criteres_Validite_Cons_avis.pdf)). Example 34.2: personalized article recommendations via cookies = overlay with equal **Accept / Refuse**.

### Does a cookieless visitor hash trigger Art. 8.1?

| Argument **no banner** | Argument **banner required** |
|---|---|
| Aggregate counts only; no individual profiles; hash not stored long-term; no “evaluation” of the person | Technology **can** distinguish returning visitors within a day → **identification function** exists |
| No cookies → not the “disabled by default” cookie scenario, but parallel logic applies | CAI lists **web analytics tools** as PI collection examples on its enterprise page |
| Behavior aggregated across users, not scored per person | Any PI collection via technology requires **published privacy policy** anyway (mandatory) |

**Conservative QC posture for Portal:** gate the beacon behind **express opt-in** for Quebec visitors (geo or client flag), **Reject = Accept** prominence, French-first copy, consent log. **Aggressive posture:** privacy-policy-only if counsel accepts that daily ephemeral hashing is not “profiling” and identification function is not “activated” for individual-level decisions — **higher complaint risk**.

### Other Loi 25 obligations (even without banner)

- **Privacy policy** mandatory for PI collected by technology ([CAI](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises)).
- **EFVP (PIA)** for new tracking systems — likely triggered when rolling Insights to QC clients ([Loi 25](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_Loi_25.pdf)).
- Cross-border disclosure (Portal infra outside QC) must be disclosed; contracts / transfer assessment if data leaves Quebec.
- **Privacy officer** contact public for the client organization.

---

## Implications for a cookieless first-party beacon

### Architecture properties that matter legally

| Property | ePrivacy / FR | PIPEDA | Loi 25 |
|---|---|---|---|
| No cookie / localStorage / pixel on device | Keeps Art. 82 out of scope | Reduces “surprise” tracking | Supports “not active by default” narrative |
| First-party collection endpoint | Required for CNIL exemption path; expected for SMB | Single-site OPC carve-out | Data stays client-controlled |
| Server hash, daily salt rotation | Matches CNIL anti-persistence intent | Minimization | Reduces re-identification risk |
| No raw IP/UA storage | GDPR minimization | Lower harm | Supports anonymization story |
| No cross-site / cross-client IDs | CNIL hard requirement | Expected | Avoids profiling scale |
| Aggregate reporting only | Anonymous stats (CNIL) | Reasonable purpose | Not “evaluating” individuals if truly aggregate |

### Unique visitor counting — trade-offs

**Plausible / Fathom pattern** ([Plausible data policy](https://plausible.io/data-policy)):

```
hash(daily_salt + website_domain + ip_address + user_agent)
```

- Salt rotated and discarded ≤24h; raw IP/UA never persisted.
- **Uniques = per day, per site, per device class** — not cohorts, not logged-in users, not multi-day return rate.
- **Pageviews** can be counted without hashing (no “visitor” concept).
- **Sessions** without cookies require heuristics (e.g. hash + 30-min window) — increases identification surface; avoid for v1 Insights (“three plain truths” fits daily/period uniques + top pages).

**Portal Insights alignment** (per `apps/portal/CONTEXT.md`): visitors for period, top pages/actions, one takeaway — **no mini-GA** — maps cleanly to daily-hash uniques + page aggregates.

### What third-party privacy docs claim (not law, but architectural reference)

- **Plausible:** no cookies, no persistent IDs, no consent banner for analytics ([data policy](https://plausible.io/data-policy)).
- **Fathom:** no terminal equipment access; Art. 5(3) consent not required; GDPR legitimate interest ([ePrivacy compliance](https://usefathom.com/legal/compliance/eprivacy-compliant-website-analytics)).

Use as **engineering reference**, not legal opinion. Portal should document its **own** parallel analysis.

---

## Recommended approach for Portal Insights

### Product defaults (v1)

1. **Beacon:** tiny first-party `POST` or `GET` to `{clientSite}/insights` or `{clientSubdomain}.portal.tld/collect` — **no JS storage APIs**.
2. **Server:** derive ephemeral `visitor_day_key = HMAC(daily_secret, site_id + ip_trunc + ua_normalized)`; store only `{site_id, day, path, referrer_host, visitor_day_key}`; **truncate IP** (IPv4 /24 or CNIL-style last octet zeroed) before hash input if desired.
3. **Retention:** ≤25 months aggregates (CNIL-aligned); raw events rolled up / deleted sooner (e.g. 90 days).
4. **Isolation:** strict `site_id` tenant boundary; Operator never builds cross-client analytics.
5. **No** fingerprinting surface (screen size, WebGL, fonts, etc.).

### Consent strategy by client geography (pragmatic solo-builder)

| Client primary audience | Recommended UX |
|---|---|
| France | **No banner** if architecture above; privacy policy clause + CNIL-style transparency; LIA template in Portal kit |
| ROC (Canada outside QC) | Privacy policy disclosure; optional lightweight notice bar linking to policy; implied consent defensible for SMB sites |
| Quebec | **Opt-in banner** (analytics category off until accept) unless/until QC legal sign-off on cookieless-only path; French copy; equal Reject/Accept |
| Mixed FR+Qc | QC rules for `.ca` QC-facing clients; FR path for `.fr` clients — **per-site config in Client Desk** |

### Deliverables Portal should ship for clients

- Privacy policy **snippet** (FR + EN) describing Insights.
- **DPA / sous-traitance** clause (Portal processor, client controller).
- **Configuration attestation** worksheet mapped to CNIL 2025 criteria (diligence, not certification).
- Optional **CMP hook**: `insights.load()` only after `analytics` consent when client already runs a banner (QC / GA-migration cases).

### Do not

- Claim “CNIL certified” or “Loi 25 compliant” badges without formal review.
- Store raw IP, full UA, or cross-day visitor IDs.
- Bundle Insights with ad pixels under one consent toggle (CNIL: mixed purposes → consent required).
- Provide cross-site “compare your audience to other Portal clients.”

---

## Sources (primary)

### France / EU

- CNIL — [Cookies : solutions pour les outils de mesure d'audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience) (July 2025 self-assessment, exemption conditions)
- CNIL — [Fiche n°16 : Use analytics on your websites and applications](https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications)
- CNIL — [Délibération n° 2020-091 — Lignes directrices cookies et traceurs (PDF)](https://cnil-d10.cnil.fr/sites/default/files/atoms/files/lignes_directrices_de_la_cnil_sur_les_cookies_et_autres_traceurs.pdf)
- CNIL — [Outil d'auto-évaluation mesure d'audience exemptée (PDF, July 2025)](https://www.cnil.fr/sites/default/files/2025-07/outil_d_auto-evaluation_mesure_d_audience.pdf)
- CNIL — [Site web, cookies et autres traceurs](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- ePrivacy Directive 2002/58/EC Art. 5(3) — [EUR-Lex CELEX:32002L0058](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058)
- GDPR — [Regulation (EU) 2016/679](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)

### Canada (federal)

- OPC — [PIPEDA Fair Information Principle 3 – Consent](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/)
- OPC — [Guidelines for obtaining meaningful consent (2018)](https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/)
- OPC — [Policy position on online behavioural advertising](https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/bg_ba_1206/) (explicitly excludes single-site analytics scope)
- OPC — [Web tracking with cookies](https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/cookies/02_05_d_49)
- Treasury Board of Canada — [Web Analytics Privacy Impact Assessment Report](https://www.canada.ca/en/treasury-board-secretariat/services/access-information-privacy/privacy/web-analytics-privacy-impact-assessment-report.html)

### Quebec

- CAI — [Loi 25 (Bill 64) PDF](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_Loi_25.pdf)
- CAI — [Loi sur le privé — texte administré (Art. 8.1) PDF](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_LSP_Version_ADMIN.pdf)
- CAI — [Collecte de renseignements personnels — entreprises](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises)
- CAI — [Lignes directrices 2023-1 — Critères de validité du consentement (PDF)](https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_Criteres_Validite_Cons_avis.pdf)

### Reference implementations (privacy architecture, not legal authority)

- Plausible — [Data policy](https://plausible.io/data-policy)
- Fathom — [ePrivacy compliance](https://usefathom.com/legal/compliance/eprivacy-compliant-website-analytics)
- Fathom — [Privacy policy (processor section)](https://usefathom.com/privacy)

---

## Open questions (grilling ticket)

1. **Quebec Art. 8.1:** Does a ephemeral server-side hash used *only* for aggregate daily uniques constitute a technology with an **“identification function”** even when no individual-level record is exposed to the client? CAI has no analytics-specific safe harbor — need formal QC legal read or CAI doctrine search.
2. **IP truncation:** CNIL self-assessment recommends truncating IPv4 (last octet). Is `/24` truncation sufficient for Portal’s LIA, or must we adopt CNIL’s exact rule for FR clients even in cookieless mode?
3. **Session heuristic:** If Insights later adds “sessions,” does a 30-minute window on the same daily hash reclassify the product under Loi 25 profiling?
4. **Cross-border hosting:** Portal backend region(s) — do QC clients require in-province processing or contractual CAI-style transfer clauses when hash inputs are processed in EU/US?
5. **Logged-in Client Workspace:** Portal auth cookies are strictly necessary; Insights must not reuse auth IDs for site beacon correlation — confirm boundary in threat model.
6. **Minor visitors:** OPC treats under-13 as unable to consent — do SMB client sites need age gating if Insights loads without banner in ROC?
7. **ePrivacy Regulation:** Draft ePrivacy Regulation may introduce “privacy-friendly analytics” exceptions — monitor for changes to cookieless vs exempt-tracker split.

---

*Research subagent output for Wayfinder #22. Not legal advice — operator and each SMB client remain controllers; confirm with counsel before production rollout in QC/F R.*
