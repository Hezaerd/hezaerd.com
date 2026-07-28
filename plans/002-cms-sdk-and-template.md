# Plan 002: Package `@hezaerd/cms` + client site template

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5b4f224..HEAD -- packages/cms packages/backend/convex/cms.ts packages/backend/convex/http.ts templates/client-site`
> Compare "Current state" excerpts if drift detected.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-cms-convex-backend.md (DONE)
- **Category**: direction
- **Planned at**: commit `5b4f224`, 2026-07-28

## Why this matters

Each client site is a **custom repo** that declares editable field keys in code and reads **baked content from R2 in production** — zero Convex at runtime (`cms-architecture.md`). The shared npm package `@hezaerd/cms` encodes that contract: `registerFields()` for CI schema sync, and `<EditableText>` / `<EditableImage>` components that render snapshot values. The template repo proves the loop before Portal UI (plan 003) and CF Pages (plan 005) integrate.

## Current state

- `packages/cms/` — **does not exist** (architecture says create at `hezaerd.com/packages/cms`).
- `templates/client-site/` — **does not exist**.
- Plan 001 (when done) exposes `POST /cms/register-schema` and publishes `cms/{slug}/published/latest.json`.
- Monorepo packages follow `packages/ui/package.json` pattern: `"name": "@hezaerd/ui"`, workspace `"type": "module"`, exports map.
- Package manager: **Bun** workspaces (`package.json` workspaces: `apps/*`, `packages/*`).
- Commit scopes: `commitlint.config.mjs` allows scopes from `packages/` directory names — new scope `cms` auto-allowed once folder exists.

Exemplar package structure (`packages/ui/package.json`):

```1:13:packages/ui/package.json
{
  "name": "@hezaerd/ui",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
```

**Architecture constraints** (inline — executor has not read the doc):

1. Code-first registry: `registerFields({ slug, fields })` runs in CI post-build.
2. Prod public routes: fetch snapshot JSON only (immutable CDN/R2 URL).
3. Preview route `/preview`: SSR with draft values + JWT — **skeleton only in this plan**; full JWT validation in plan 005.
4. v1 field types: `text` and `image` only.
5. Distribution: npm private via GitHub Packages (publish config in this plan; actual registry secret is operator-managed).

## Commands you will need

| Purpose | Command | Expected on success |
| ------- | ------- | ------------------- |
| Install | `bun install` | exit 0 |
| Typecheck cms | `bun run --filter @hezaerd/cms typecheck` | exit 0 |
| Typecheck all | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Build template (local) | `bun run --filter @hezaerd/client-site-template build` | exit 0, `dist/` output |

## Scope

**In scope**:

- `packages/cms/` — full package source
- `templates/client-site/` — reference client site (workspace package `@hezaerd/client-site-template`, private)
- Root `package.json` — ensure workspace picks up new packages (should be automatic via `packages/*`)
- `templates/client-site/.github/workflows/deploy.yml` — CI skeleton calling registerSchema + CF deploy placeholder
- `packages/cms/README.md` — usage for client repos

**Out of scope**:

- Portal UI (`apps/portal/**`) — plan 003
- Convex backend changes except fixing bugs found integrating — if API mismatch, STOP and report to update plan 001
- GitHub Packages publish secrets / actual `npm publish` — document steps, optional dry-run
- Cloudflare Pages project creation — plan 005
- Image variant pipeline (WebP/AVIF) — plan 003 upload + plan 005 CDN
- Extracting template to separate GitHub repo `hezaerd/client-site-template` — document mirror steps; monorepo template is sufficient for v1 dev

## Git workflow

- Branch: `feat/cms-002-sdk-template`
- Commits: `feat(cms): …`, `feat(portfolio): …` wrong scope — use `cms` or `backend` only as appropriate

## Steps

### Step 1: Scaffold `packages/cms`

Create `packages/cms/package.json`:

```json
{
  "name": "@hezaerd/cms",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./react": "./src/react/index.ts",
    "./register": "./src/register.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@hezaerd/config": "workspace:*",
    "@types/react": "catalog:",
    "typescript": "catalog:"
  }
}
```

Add `tsconfig.json` extending `@hezaerd/config`.

**Verify**: `bun install && bun run --filter @hezaerd/cms typecheck` → exit 0

### Step 2: Implement `registerFields()`

Create `packages/cms/src/register.ts`:

```typescript
export type CmsTextField = {
  fieldKey: string;
  type: "text";
  constraints: { maxLength: number; multiline?: boolean };
};

export type CmsImageField = {
  fieldKey: string;
  type: "image";
  constraints: { aspect: string; maxWidth: number; priority?: boolean };
};

export type CmsField = CmsTextField | CmsImageField;

export async function registerFields(input: {
  slug: string;
  fields: CmsField[];
  convexSiteUrl: string;
  deployToken: string;
}): Promise<{ registered: number; deprecated: number }>
```

- POST to `${convexSiteUrl}/cms/register-schema`
- `Authorization: Bearer ${deployToken}`
- Body: `{ slug, fields }` matching plan 001 API
- Throw descriptive errors on non-2xx (include response body text, no token in error messages)

Export from `src/index.ts`.

**Verify**: unit-level — typecheck passes; manual test deferred to Step 5 with template CI script

### Step 3: Implement snapshot loader + React components

Create `packages/cms/src/snapshot.ts`:

- `fetchPublishedSnapshot(url: string): Promise<PublishedSnapshot>` — fetch `latest.json`, parse, validate shape `{ version, publishedAt, fields: Record<string,string> }`
- `getField(snapshot, key, fallback?: string): string`

Create `packages/cms/src/react/EditableText.tsx`:

- Props: `{ fieldKey: string; snapshot: PublishedSnapshot; as?: keyof JSX.IntrinsicElements; className?: string }`
- Renders `snapshot.fields[fieldKey] ?? ""` as text content (no contentEditable — public prod is read-only baked HTML)

Create `packages/cms/src/react/EditableImage.tsx`:

- Props: `{ fieldKey, snapshot, alt, className?, sizes?, priority? }`
- Renders `<img src={url} width/height if known from constraints optional>`

**Important**: These components do **not** connect to Convex. Name reflects architecture doc; they are snapshot renderers. Preview draft injection happens in plan 005 via SSR props.

Export `./react` entry.

**Verify**: `bun run --filter @hezaerd/cms typecheck` → exit 0

### Step 4: Create `templates/client-site`

Scaffold a minimal **Astro or Vite+React SSR** site — prefer **Astro** for static prod + SSR preview route unless repo already standardizes on TanStack Start for client sites (it does not; client sites are separate). Use **Astro 5** static output for prod:

Directory layout:

```
templates/client-site/
  package.json          # name: @hezaerd/client-site-template, private: true
  astro.config.mjs
  src/
    cms/fields.ts       # registerFields() field declarations — single source of truth
    pages/
      index.astro       # uses EditableText/EditableImage with build-time snapshot fetch
      preview.astro     # SSR stub: reads ?token=, placeholder draft message (plan 005 completes)
  scripts/
    register-schema.ts  # bun script calling registerFields()
```

`src/cms/fields.ts` example:

```typescript
import type { CmsField } from "@hezaerd/cms";

export const CMS_SLUG = "demo-client"; // overridden per client repo

export const CMS_FIELDS: CmsField[] = [
  { fieldKey: "hero.title", type: "text", constraints: { maxLength: 80 } },
  { fieldKey: "hero.photo", type: "image", constraints: { aspect: "16/9", maxWidth: 1920, priority: true } },
];
```

Build-time snapshot:

- Env `CMS_SNAPSHOT_URL` — public URL to `cms/{slug}/published/latest.json` (R2 public bucket or custom domain)
- At build, fetch snapshot; if 404, use empty fields (first deploy before first publish)

**Verify**: `bun run --filter @hezaerd/client-site-template build` → exit 0

### Step 5: CI script for schema registration

Add `templates/client-site/scripts/register-schema.ts`:

- Reads env: `CONVEX_SITE_URL`, `CMS_DEPLOY_TOKEN`, `CMS_SLUG`
- Imports `CMS_FIELDS` from `src/cms/fields.ts`
- Calls `registerFields()`
- Exit 1 on failure (fail CI)

Add `templates/client-site/.github/workflows/deploy.yml`:

```yaml
name: Deploy client site
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - name: Register CMS schema
        env:
          CONVEX_SITE_URL: ${{ secrets.CONVEX_SITE_URL }}
          CMS_DEPLOY_TOKEN: ${{ secrets.CMS_DEPLOY_TOKEN }}
          CMS_SLUG: ${{ vars.CMS_SLUG }}
        run: bun run register-schema
      - name: Build
        env:
          CMS_SNAPSHOT_URL: ${{ vars.CMS_SNAPSHOT_URL }}
        run: bun run build
      # CF Pages deploy step commented with TODO for plan 005
```

Add `"register-schema": "bun scripts/register-schema.ts"` script to template `package.json`.

**Verify**: with plan 001 backend running and token created, `CMS_DEPLOY_TOKEN=… CONVEX_SITE_URL=… CMS_SLUG=… bun run register-schema` in template dir → success JSON

### Step 6: Package README + GitHub Packages notes

Write `packages/cms/README.md`:

- Install from GitHub Packages (`@hezaerd/cms`)
- Field declaration example
- Build-time snapshot env var
- Link to `templates/client-site` as starting point
- Note: prod never imports Convex

Document in README (not committed secrets):

- `NODE_AUTH_TOKEN` for CI publish
- `.npmrc` scope `@hezaerd:registry=https://npm.pkg.github.com`

Optional: add `"publishConfig": { "registry": "https://npm.pkg.github.com" }` to `packages/cms/package.json` when going public on registry.

**Verify**: `bun run check` → exit 0

## Test plan

| Case | Command / action | Expected |
| ---- | ---------------- | -------- |
| Package typecheck | `bun run --filter @hezaerd/cms typecheck` | exit 0 |
| Template build without snapshot | build with empty CMS_SNAPSHOT_URL | exit 0, empty hero |
| register-schema | bun script with valid token | Convex rows created |
| Duplicate register | run register twice with same fields | idempotent upsert |
| Field removed from code | remove field from CMS_FIELDS, re-register | deprecated in Convex |

## Done criteria

- [ ] `@hezaerd/cms` export paths: `.`, `./react`, `./register`
- [ ] `registerFields()` successfully POSTs to plan 001 HTTP route (manual proof)
- [ ] Template builds and renders snapshot-driven hero text/image
- [ ] CI workflow file documents register + build sequence
- [ ] `bun run typecheck` exit 0
- [ ] `plans/README.md` row 002 → DONE

## STOP conditions

- Plan 001 HTTP route or payload shape differs from this plan — STOP, report API delta.
- Astro (or chosen framework) cannot SSR `/preview` without disproportionate setup — STOP with recommendation (Vite SSR vs Astro).
- You feel tempted to add Convex client to template prod bundle — STOP (architecture violation).

## Maintenance notes

- When semver-breaking field API changes, bump `@hezaerd/cms` minor/major and document in README.
- Template `CMS_SLUG` must match Portal `clients.slug` — enforce in client onboarding checklist (plan 005).
- Separate GitHub repo mirror: copy `templates/client-site` to `hezaerd/client-site-template` when first real client onboarded; monorepo copy remains dev reference.
