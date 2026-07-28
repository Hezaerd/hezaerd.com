# Plan 001: CMS Convex — schema, deploy tokens, registerSchema, publish R2

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5b4f224..HEAD -- packages/backend/convex/schema.ts packages/backend/convex/http.ts packages/backend/convex/lib/r2.ts packages/backend/convex/clients.ts`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `5b4f224`, 2026-07-28

## Why this matters

Portal CMS UI and client sites have no data layer today. The architecture (`apps/portal/docs/cms-architecture.md`) requires code-first field registration at deploy time, draft values in Convex, and **published content baked to R2** so public sites never call Convex at runtime. This plan delivers the backend contract every other CMS plan depends on: tables, deploy-token auth, `registerSchema`, draft upsert, and atomic publish to versioned JSON on R2.

## Current state

Relevant files:

- `packages/backend/convex/schema.ts` — Convex schema. Has `clients.features.cms` boolean but **no CMS tables**.
- `packages/backend/convex/http.ts` — HTTP router (WorkOS AuthKit + Stripe webhook). **No CMS routes**.
- `packages/backend/convex/lib/functions.ts` — `authedQuery`, `operatorMutation`, etc. **Use these wrappers** for all new queries/mutations.
- `packages/backend/convex/lib/r2.ts` — R2 S3 client, presigned upload/download, `deleteR2Object`, `headR2Object`. **No server-side `PutObject`** for JSON snapshots yet.
- `packages/backend/convex/files.ts` — exemplar for client-scoped queries, operator desk vs workspace split, Needs Attention shape (not CMS yet).
- `packages/backend/convex/clients.ts` — `setFeature` toggles `features.cms` but comment says it does **not** create Needs Attention rows (plan 004).
- `apps/portal/docs/cms-architecture.md` — locked decisions and target data shapes.

Schema excerpt (no CMS today):

```4:24:packages/backend/convex/schema.ts
export default defineSchema({
  clients: defineTable({
    name: v.string(),
    slug: v.string(),
    // ...
    features: v.object({
      insights: v.boolean(),
      cms: v.boolean(),
    }),
```

HTTP router excerpt:

```9:30:packages/backend/convex/http.ts
const http = httpRouter();
authKit.registerRoutes(http);
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  // ...
});
export default http;
```

**Domain vocabulary** (from `apps/portal/CONTEXT.md`):

- Code flag: `features.cms`
- Operator Desk section: **CMS** (not an Area)
- Client Workspace Area: **Mon site** (never expose "CMS" to clients)
- Field keys are declared in client site code; Portal only edits **values**

**Target tables** (from `cms-architecture.md`):

| Table | Purpose |
| ----- | ------- |
| `cmsFieldSchemas` | Registered at CI deploy: `{ clientId, fieldKey, type, constraints, label?, defaultValue?, deprecated? }` |
| `cmsFieldValues` | Draft per field: `{ clientId, fieldKey, draftValue, updatedAt }` |
| `cmsDeployTokens` | Hashed token per client for CI `registerSchema` |
| `cmsPublishState` | Per-client publish metadata: `{ clientId, version, publishedAt, r2Key }` |

**Snapshot JSON shape** (written to R2 on publish):

```json
{
  "version": 3,
  "publishedAt": 1730000000000,
  "fields": {
    "hero.title": "River Café",
    "hero.photo": "https://cdn.example/cms/river-cafe/assets/hero.photo/abc.webp"
  }
}
```

R2 keys:

- Published snapshot: `cms/{slug}/published/v{N}.json`
- Also write/update pointer: `cms/{slug}/published/latest.json` (same content, for stable SDK fetch URL in v1)
- Images (plan 003): `cms/{slug}/assets/{fieldKey}/{hash}.webp` — **out of scope for draft text publish in this plan**, but schema must allow `image` type

**Repo has no automated test suite** (no `*.test.ts` files). Verification is typecheck + Convex dev manual/API checks documented below.

## Commands you will need

| Purpose | Command | Expected on success |
| ------- | ------- | ------------------- |
| Install | `bun install` (repo root) | exit 0 |
| Typecheck backend | `bun run --filter @hezaerd/backend typecheck` | exit 0 |
| Typecheck all | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Convex dev | `bun run dev:backend` | dev server running |
| Convex codegen | `bun run convex codegen` | regenerates `_generated/` |

Commit style (from repo): Conventional Commits, e.g. `feat(backend): add cms schema tables`.

## Scope

**In scope**:

- `packages/backend/convex/schema.ts`
- `packages/backend/convex/cms.ts` (create — public queries/mutations)
- `packages/backend/convex/cmsInternal.ts` (create — internal helpers)
- `packages/backend/convex/lib/cms.ts` (create — validators, field-key rules, token hashing)
- `packages/backend/convex/lib/r2.ts` (add `putR2Object`, `getR2ObjectText`)
- `packages/backend/convex/http.ts` (register `/cms/register-schema`)
- `packages/backend/.env.example` (document new optional env vars if any)

**Out of scope** (do NOT touch):

- `apps/portal/**` — UI is plan 003
- `packages/cms/**` — SDK is plan 002
- `clients.setFeature` Needs Attention side effects — plan 004
- Cloudflare CDN purge API — plan 005 (publish writes R2 only here)
- Image upload presign / variant generation — plan 003
- Preview JWT issuance — plan 003

## Git workflow

- Branch: `feat/cms-001-convex-backend` (or operator preference)
- One commit per logical step is fine
- Do NOT push or open PR unless instructed

## Steps

### Step 1: Add Convex schema tables

In `packages/backend/convex/schema.ts`, add four tables with indexes:

**`cmsFieldSchemas`**

- `clientId`: `v.id("clients")`
- `fieldKey`: `v.string()` — dot notation, e.g. `hero.title`
- `type`: `v.union(v.literal("text"), v.literal("image"))`
- `constraints`: `v.object({ ... })` — discriminated by type at validation layer in `lib/cms.ts`:
  - text: `{ maxLength: v.number(), multiline: v.optional(v.boolean()) }`
  - image: `{ aspect: v.string(), maxWidth: v.number(), priority: v.optional(v.boolean()) }`
- `label`: `v.optional(v.string())` — OP-configured display label
- `defaultValue`: `v.optional(v.string())` — for text; image defaults omitted in v1
- `deprecated`: `v.optional(v.boolean())` — set when field removed from code, never hard-delete
- Indexes: `by_clientId`, `by_clientId_and_fieldKey` (unique logical key)

**`cmsFieldValues`**

- `clientId`, `fieldKey`, `draftValue` (`v.string()` — text content or image public URL after upload in plan 003)
- `updatedAt`: `v.number()`
- Indexes: `by_clientId`, `by_clientId_and_fieldKey`

**`cmsDeployTokens`**

- `clientId`, `tokenHash` (`v.string()`), `label` (`v.optional(v.string())`), `createdAt`, `revokedAt` (`v.optional(v.number())`)
- Index: `by_clientId`, `by_tokenHash`

**`cmsPublishState`**

- `clientId`, `version` (`v.number()`, starts at 0), `publishedAt` (`v.optional(v.number())`), `r2Key` (`v.optional(v.string())`)
- Index: `by_clientId` (one row per client — upsert pattern)

**Verify**: `bun run convex codegen` → exit 0; `bun run --filter @hezaerd/backend typecheck` → exit 0

### Step 2: Create `lib/cms.ts` validators and helpers

Create `packages/backend/convex/lib/cms.ts` with:

- `FIELD_KEY_PATTERN` — regex `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$` (lowercase segments)
- `validateFieldKey(key: string): string`
- Convex validators exported for reuse: `cmsTextConstraintsValidator`, `cmsImageConstraintsValidator`, `cmsFieldSchemaValidator`
- `hashDeployToken(plaintext: string): string` — use Node `crypto.createHash("sha256")` with a server pepper from env `CMS_TOKEN_PEPPER` (document in `.env.example`; throw clear error if missing in production paths)
- `constantTimeEqual(a: string, b: string): boolean`
- `buildSnapshotFields(schemas, values): Record<string, string>` — merges draft values with schema defaults for non-deprecated fields; skips deprecated keys; throws if required field missing value and no default

Match error message style from `files.ts` (French, short): e.g. `"Clé de champ invalide"`, `"Token deploy révoqué"`.

**Verify**: `bun run --filter @hezaerd/backend typecheck` → exit 0

### Step 3: Extend R2 helpers

In `packages/backend/convex/lib/r2.ts`, add:

```typescript
export async function putR2Object(input: {
  key: string;
  body: string | Uint8Array;
  contentType: string;
  cacheControl?: string;
}): Promise<void>

export async function getR2ObjectText(key: string): Promise<string>
```

Use `PutObjectCommand` / `GetObjectCommand`. For published snapshots set `cacheControl: "public, max-age=31536000, immutable"` on versioned keys; `latest.json` gets shorter cache (`max-age=60`) so SDK can pick up new publishes within a minute without CDN purge.

**Verify**: `bun run --filter @hezaerd/backend typecheck` → exit 0

### Step 4: Implement `cms.ts` — operator + client API

Create `packages/backend/convex/cms.ts` following `files.ts` patterns:

**Queries (operator)**

- `listSchemaForDesk` — `operatorQuery`, args `{ slug }`, returns all `cmsFieldSchemas` for client sorted by `fieldKey`, joined with current draft + published value if any
- `getDeployTokens` — list tokens for client (never return hash; return `{ id, label, createdAt, revokedAt }`)

**Mutations (operator)**

- `createDeployToken` — generates 32-byte random hex plaintext, stores hash, returns `{ token: plaintext }` **once**
- `revokeDeployToken` — sets `revokedAt`
- `updateFieldLabel` — patch `label` on existing schema row (field must exist)
- `updateFieldDefault` — patch `defaultValue` for text fields only

**Queries (client workspace)**

- `listFieldsForWorkspace` — `authedQuery`, client role only, `features.cms` must be true, returns schemas (non-deprecated) + draft values + `{ hasUnpublishedChanges: boolean }` computed by comparing draft snapshot to last published

**Mutations (client)**

- `upsertDraftText` — args `{ slug, fieldKey, value }`, validates against schema constraints (`maxLength`, trim rules), patches `cmsFieldValues`

**Mutations (client or operator — choose client-only for v1)**

- `publish` — `authedMutation`, client role, `features.cms` true:
  1. Load schemas + drafts
  2. Build snapshot object
  3. Increment version in `cmsPublishState`
  4. `putR2Object` to `cms/{slug}/published/v{N}.json` and `cms/{slug}/published/latest.json`
  5. Update `cmsPublishState`
  6. Return `{ version, publishedAt, r2Key }`

Use `assertClientAccess` from `lib/users.ts` for slug scoping.

**Verify**: `bun run --filter @hezaerd/backend typecheck` → exit 0

### Step 5: Internal registerSchema + HTTP route

Create `packages/backend/convex/cmsInternal.ts`:

- `registerSchema` internal mutation called from HTTP action with validated payload:
  - `{ slug, fields: Array<{ fieldKey, type, constraints }> }`
- Logic:
  1. Resolve client by slug
  2. Upsert each field in payload (update constraints if changed)
  3. Mark fields present in DB but **absent** from payload as `deprecated: true`
  4. Never delete rows

Create HTTP action in new file `packages/backend/convex/cmsHttp.ts` (or inline in `http.ts`):

- Route: `POST /cms/register-schema`
- Auth: `Authorization: Bearer <deploy-token>`
- Lookup token by hash, check not revoked, check `token.clientId` matches slug's client
- Body JSON schema validated
- Call internal `registerSchema`
- Return `200` with `{ registered: number, deprecated: number }`

Register in `http.ts`:

```typescript
import { registerCmsRoutes } from "./cmsHttp";
registerCmsRoutes(http);
```

**Verify** (manual, Convex dev running):

1. Create a test client in dashboard or via existing seed
2. Call `cms.createDeployToken` from Convex dashboard for that client's slug
3. `curl -X POST "$CONVEX_SITE_URL/cms/register-schema" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"<slug>","fields":[{"fieldKey":"hero.title","type":"text","constraints":{"maxLength":80}}]}'`
4. Expect HTTP 200 and row in `cmsFieldSchemas`

### Step 6: Document env vars

Update `packages/backend/.env.example`:

```
# CMS deploy token hashing (set on Convex deployment):
#   CMS_TOKEN_PEPPER=<random-string>
```

Note: set via `bunx convex env set CMS_TOKEN_PEPPER ...` not committed.

**Verify**: `bun run check` → exit 0

## Test plan

No test runner exists. Perform manual regression checklist:

| Case | How | Expected |
| ---- | --- | -------- |
| Invalid field key | registerSchema with `Hero.Title` | 400/error |
| Revoked token | revoke then POST register-schema | 401 |
| Wrong slug for token | POST with mismatched slug | 403 |
| Publish without drafts | publish with defaults only | R2 JSON with default/empty values |
| Publish increments version | publish twice | `v1.json`, `v2.json`, `latest.json` updated |
| Deprecated field | register reduced field set | old field `deprecated: true`, excluded from snapshot |

Record curl commands and R2 object keys in PR description.

## Done criteria

ALL must hold:

- [ ] Four CMS tables exist in `schema.ts` with documented indexes
- [ ] `cms.ts` exports desk/workspace queries and publish/upsert mutations
- [ ] `POST /cms/register-schema` works with deploy token (manual curl proof)
- [ ] Publish writes `cms/{slug}/published/v{N}.json` to R2 (verify via R2 dashboard or `getR2ObjectText` in Convex dashboard action)
- [ ] `bun run typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] No files outside scope modified
- [ ] `plans/README.md` row 001 updated to DONE

## STOP conditions

Stop and report if:

- "Current state" excerpts don't match live files (drift).
- R2 env vars (`R2_ACCOUNT_ID`, etc.) are missing on Convex deployment — publish cannot be verified; report which vars are missing, do not stub fake R2.
- Convex HTTP actions pattern differs from existing `http.ts` setup in a way that blocks route registration.
- You need to add `image` upload in this plan to make publish work — defer to plan 003 and publish text-only fields first.
- A step's verification fails twice after reasonable fix.

## Maintenance notes

- **Plan 002** will call `/cms/register-schema` from client CI; keep request/response shape stable or version it.
- **Plan 003** adds image presign using `cms/{slug}/assets/...` keys — reuse `lib/r2.ts`, don't duplicate S3 client.
- **Plan 005** adds Cloudflare CDN purge after publish; consider a `purgeCdn: boolean` internal flag or separate action so dev publish works without CF credentials.
- Reviewers: scrutinize deploy token storage (hash only), slug/token binding, and that deprecated fields never appear in published snapshots.
