# Plan 005: Pilot client site on Cloudflare Pages

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5b4f224..HEAD -- templates/client-site packages/backend/convex/cms.ts packages/cms`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH (infra + cross-repo)
- **Depends on**: plans/001 through 004 (all DONE)
- **Category**: direction
- **Planned at**: commit `5b4f224`, 2026-07-28

## Why this matters

Architecture decision: **one Cloudflare Pages project per client**, prod reads **R2 snapshot** (no Convex), content publish **without rebuild**, preview via **JWT SSR**. Plans 001–004 build the Portal and SDK loop inside the monorepo; this plan proves production hosting end-to-end with one pilot client before onboarding real customers.

## Current state

- `templates/client-site/` — created in plan 002 with register-schema CI and static build; CF deploy step likely commented/TODO.
- R2 bucket configured for Portal Files (`packages/backend/.env.example` documents `R2_*` vars).
- Portal on Vercel; client sites explicitly **not** on Vercel per architecture.
- No Cloudflare Workers/Pages config in monorepo yet.

**Architecture reminders**:

- Publish: `cms/{slug}/published/v{N}.json` + `latest.json` on R2; then **purge CDN**
- Preview: `/preview?token=…`, JWT ~15 min from Portal, `noindex`, SSR draft from Convex (client site calls Convex **only on preview route** OR Portal passes draft via token payload — **prefer minimal preview**: JWT contains signed slug + expiry; preview SSR fetches draft via Convex HTTP endpoint added in this plan OR public read-only preview API)

**Preview data access decision for v1**:

Add to plan 001 backend (if not present when executing 005):

- `GET /cms/preview-content?token=…` HTTP action — validates JWT, returns draft snapshot JSON (same shape as published). Client `/preview` page fetches this server-side. Keeps Convex URL server-side only on preview route.

Document this as Step 2 below.

## Commands you will need

| Purpose | Command | Expected |
| ------- | ------- | -------- |
| Wrangler | `bunx wrangler --version` | CLI available |
| Template build | `bun run --filter @hezaerd/client-site-template build` | exit 0 |
| CF deploy | `bunx wrangler pages deploy dist --project-name=<name>` | deployment URL |
| Typecheck | `bun run typecheck` | exit 0 |

## Scope

**In scope**:

- `templates/client-site/` — preview route, env config, wrangler.toml
- `templates/client-site/.github/workflows/deploy.yml` — full CF Pages deploy
- `packages/backend/convex/cmsHttp.ts` — preview content endpoint + CDN purge hook on publish (if not in 001)
- Cloudflare setup documentation in `templates/client-site/DEPLOY.md`
- Optional: extract/copy to standalone repo `hezaerd/client-site-template` (operator executes manually on GitHub)

**Out of scope**:

- Multi-client fleet automation
- Custom domains per client (document manual CF steps)
- AVIF variants (WebP-only OK)
- Insights

## Prerequisites (operator-owned secrets)

Executor must request or confirm these exist before deploy steps:

| Secret / var | Where |
| ------------ | ----- |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub vars |
| `CMS_DEPLOY_TOKEN` | per-client GitHub secret |
| `CONVEX_SITE_URL` | GitHub secret |
| `CMS_SNAPSHOT_URL` | public R2 or CDN URL to `latest.json` |
| `CMS_PREVIEW_JWT_SECRET` | CF Pages env + Convex env (must match) |
| R2 public access or custom domain for snapshot JSON + assets |

**STOP** if operator won't provision CF account access — report BLOCKED.

## Git workflow

- Branch: `feat/cms-005-cf-pages-pilot`
- Infra commits separate from docs OK

## Steps

### Step 1: R2 public read path for published snapshots

Configure (document in DEPLOY.md — operator executes in CF dashboard):

- R2 bucket custom domain **or** public bucket policy for prefix `cms/*/published/*.json` and `cms/*/assets/*`
- Resulting base URL e.g. `https://cdn.hezaerd.com/cms/demo-client/published/latest.json`
- Set `CMS_SNAPSHOT_URL` in template build env

**Verify**: `curl -s "$CMS_SNAPSHOT_URL" | head` → valid JSON after a Portal publish

### Step 2: Preview content HTTP endpoint

In `packages/backend/convex/cmsHttp.ts` add:

- `GET /cms/preview-content` — query param `token`
- Validate JWT with `CMS_PREVIEW_JWT_SECRET`
- Load draft values + schema defaults, return JSON `{ fields: Record<string,string> }`
- Headers: `Cache-Control: no-store`

Update `templates/client-site/src/pages/preview.astro` (or equivalent):

- Server-side: read `token` from URL, fetch preview JSON from Convex site URL
- Render page with draft fields using same components as prod
- Add `<meta name="robots" content="noindex,nofollow">`

**Verify**: Generate preview link from Portal → page shows draft text, not published

### Step 3: CDN purge on publish

In `cms.publish` (plan 001), after R2 write:

- If env `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` set, call CF cache purge API for:
  - `/cms/{slug}/published/latest.json`
  - `/cms/{slug}/published/v{N}.json`
- If env missing, skip silently (dev mode)

Use fetch to `https://api.cloudflare.com/client/v4/zones/{zoneId}/purge_cache`

**Verify**: After publish, `latest.json` reflects new content within ~60s without rebuild

### Step 4: Wrangler + Pages project

Add `templates/client-site/wrangler.toml`:

```toml
name = "demo-client-site"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

Complete GitHub workflow deploy step:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=demo-client
  env:
    CMS_SNAPSHOT_URL: ${{ vars.CMS_SNAPSHOT_URL }}
```

Create CF Pages project `demo-client` (manual first time or via API).

Set Pages env vars: `CMS_SNAPSHOT_URL`, `CONVEX_SITE_URL` (preview only, server-side).

**Verify**: Push to main → GH Action green → `*.pages.dev` URL loads prod snapshot

### Step 5: Wire pilot client in Portal

1. Create Client in Portal with slug matching template `CMS_SLUG` (e.g. `demo-client`)
2. Enable CMS feature (plan 004 unlock)
3. Generate deploy token, set GitHub secrets
4. Run register-schema + deploy
5. Client edits Mon site → publish → prod site updates without redeploy

Document checklist in `templates/client-site/DEPLOY.md`.

**Verify**: Full E2E script in DEPLOY.md passes

### Step 6: Performance smoke check

On deployed `*.pages.dev`:

- Lighthouse or manual: no Convex/WebSocket requests on `/` (prod)
- LCP image uses `priority` field if hero image set
- View source: baked text in HTML (not client-side fetch of CMS JSON for v1 static — if Astro SSG, JSON fetched at build time; after publish + purge, trigger **rebuild** OR use SSR for prod — **architecture says no rebuild for content**)

**Critical architecture alignment**:

Static SSG rebuild on content change violates "no rebuild for content change." For pilot, choose:

- **Option A**: Prod uses **SSR/edge** that fetches `latest.json` at request time (cached at CDN) — content updates via purge only.
- **Option B**: Prod remains SSG but uses **client-side fetch** of snapshot — architecture forbids "waterfall client-side CMS" on public pages.

**Implement Option A** for pilot: Astro `output: 'server'` or CF Pages Functions middleware fetching snapshot with CDN cache headers. Document in DEPLOY.md.

**Verify**: Publish new title → prod URL shows new title after CDN purge, **without** GitHub Action rebuild

### Step 7: Optional external template repo

Document steps to copy `templates/client-site` to `github.com/hezaerd/client-site-template` for client handoff. Not blocking DONE.

## Test plan

End-to-end checklist (all must pass):

- [ ] Prod route: no Convex calls in browser network tab
- [ ] Content publish updates prod within 2 min via R2 + purge only
- [ ] Preview route: draft content, noindex, invalid token → 401
- [ ] CI: register-schema on deploy succeeds
- [ ] Portal Waiting on Client / Needs Attention still coherent after pilot

## Done criteria

- [ ] Pilot site live on `*.pages.dev` or custom domain
- [ ] DEPLOY.md complete with operator checklist
- [ ] Preview + publish loops work with Portal
- [ ] CDN purge wired (or documented BLOCKED with manual purge workaround)
- [ ] `bun run typecheck` exit 0
- [ ] `plans/README.md` row 005 → DONE

## STOP conditions

- R2 snapshots cannot be read publicly and no custom domain available — STOP (prod cannot work).
- Architecture conflict: static SSG only option requires rebuild for content — STOP and implement Option A SSR before marking DONE.
- CF API token lacks Pages + Cache Purge permissions — STOP with required permission list.

## Maintenance notes

- Each new client: new CF Pages project, new deploy token, slug alignment.
- Monitor R2 egress + CF bandwidth per project (architecture benefit).
- Future: automate client provisioning script; out of scope here.
- Reviewers: confirm prod bundle has no `@hezaerd/backend` / Convex client imports.
