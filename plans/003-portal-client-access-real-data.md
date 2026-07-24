# Plan 003: Wire Portal Client + access to Convex (replace fixtures)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 934d8bc..HEAD -- apps/portal packages/backend apps/portal/CONTEXT.md apps/portal/docs/adr plans/003-portal-client-access-real-data.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/002-portal-dual-shell-dashboard.md (DONE — shells + fixtures exist)
- **Category**: direction
- **Planned at**: commit `934d8bc`, 2026-07-24

## Why this matters

Portal dual-shell UI (plan 002) is live but every Client, role, Feature flag, and Practice Cockpit number comes from `apps/portal/src/lib/portal-fixtures.ts`. Role is faked with `VITE_PORTAL_ROLE`. Convex only stores WorkOS-synced `users`. Until Client + access are real, Operators cannot create Clients, Clients cannot land in their Workspace, and Feature toggles do not persist. This plan is the **first real-data slice** agreed in product grilling: Client records, slug URLs, Operator allowlist, seat auto-bind, Features on Client — not Invoices / Needs Attention / Files yet.

## Current state

### Relevant files

- `apps/portal/CONTEXT.md` — product glossary (must stay the vocabulary for names/UI)
- `apps/portal/docs/adr/0001-dual-shell-hard-switch.md` — shell ADR; access/slug not recorded yet
- `apps/portal/src/lib/portal-fixtures.ts` — fake Clients + cockpit stats + Feature unlock helpers
- `apps/portal/src/lib/portal-role.ts` — reads `VITE_PORTAL_ROLE`; Client home params from first fixture
- `apps/portal/src/lib/use-portal-auth.ts` — WorkOS wrapper; sandbox synthetic user when no client id
- `apps/portal/src/components/convex-provider.tsx` — `ConvexProviderWithAuth` when `VITE_CONVEX_URL` set
- `packages/backend/convex/schema.ts` — only `users` (authId, email, name, pictureUrl)
- `packages/backend/convex/auth.ts` — WorkOS AuthKit webhooks insert/patch/delete `users` **without** role/clientId
- `packages/backend/convex/users.ts` — `api.users.me` returns app profile
- `packages/backend/convex/lib/functions.ts` — `authedQuery` / `authedMutation` via `requireAppUser`
- `packages/backend/convex/lib/users.ts` — `requireAppUser` / `getAppUser`
- Portal routes/shells that import fixtures or env role (must be switched):
  - `apps/portal/src/routes/index.tsx`
  - `apps/portal/src/routes/op/route.tsx`
  - `apps/portal/src/routes/op/index.tsx`
  - `apps/portal/src/routes/op/clients/index.tsx`
  - `apps/portal/src/routes/op/clients/$clientId.tsx`
  - `apps/portal/src/routes/w/$clientId/route.tsx`
  - `apps/portal/src/routes/w/$clientId/index.tsx`
  - `apps/portal/src/routes/w/$clientId/insights.tsx`
  - `apps/portal/src/routes/w/$clientId/website.tsx`
  - `apps/portal/src/components/shell/workspace-switcher.tsx`
  - `apps/portal/src/components/shell/client-workspace-shell.tsx`
  - `apps/portal/src/components/shell/practice-cockpit.tsx`
  - `apps/portal/src/components/shell/needs-attention-list.tsx` (types only — keep UI, empty data)

### Excerpt — schema today (extend, do not replace auth fields)

```4:15:packages/backend/convex/schema.ts
export default defineSchema({
  // App-owned user profile. AuthKit component keeps WorkOS auth metadata;
  // this table extends it with portal-specific fields via webhook sync.
  users: defineTable({
    authId: v.string(),
    email: v.string(),
    name: v.string(),
    pictureUrl: v.optional(v.string()),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"]),
});
```

### Excerpt — role is env-faked

```1:23:apps/portal/src/lib/portal-role.ts
import { getFirstClient } from "@/lib/portal-fixtures";

export type PortalRole = "operator" | "client";

export function resolvePortalRole(): PortalRole {
  const envRole = import.meta.env.VITE_PORTAL_ROLE;
  if (envRole === "operator" || envRole === "client") {
    return envRole;
  }
  return "operator";
}
// ...
export function getClientWorkspaceHomeParams() {
  return { clientId: getFirstClient().id };
}
```

### Excerpt — webhook creates users without role

```16:24:packages/backend/convex/auth.ts
  "user.created": async (ctx, event) => {
    const name = [event.data.firstName, event.data.lastName].filter(Boolean).join(" ").trim();
    await ctx.db.insert("users", {
      authId: event.data.id,
      email: event.data.email,
      name: name || event.data.email,
      pictureUrl: event.data.profilePictureUrl ?? undefined,
    });
  },
```

### Product decisions (locked — do not reopen)

These were decided in a grilling session and are **requirements**, not suggestions:

| # | Decision |
| - | -------- |
| 1 | First real-data slice = **Client + access** (not Needs Attention / Invoices first) |
| 2 | Access = app-owned `users.role` (`operator` \| `client`) + optional `users.clientId` |
| 3 | URL `$clientId` param = **stable slug** (e.g. `river-cafe`); Convex `_id` stays internal |
| 4 | **Client before login** — Client row may exist with zero seats |
| 5 | Operator grant = email allowlist; **only** `hezaerd@hezaerd.com` (Convex env) |
| 6 | Seat attach = **auto-bind** on sync/login when `user.email` equals exactly one Client’s `contactEmail` |
| 7 | Features (`insights` / `website`) live on Client; Feature-unlock Needs Attention **out of scope** |
| 8 | Operator **create UI** on `/op/clients` (name, slug, contactEmail; Features default off) |
| 9 | Practice Cockpit: `activeClients` real; open/paid/waiting = **0** (no fixture money) |
| 10 | Unlinked Client (`role=client`, no `clientId`) → dedicated **not linked yet** screen |

### Glossary terms to add (executor updates CONTEXT)

When implementing, append to `apps/portal/CONTEXT.md` **Language** (glossary only — no implementation details):

**Client slug**:
Stable public key for a Client in Portal URLs (`/w/{slug}`, `/op/clients/{slug}`). Unique among Clients.
_Avoid_: Using Convex document IDs in Client-facing URLs; treating display name as the route key

**Client seat**:
The single User login bound to a Client (`users.clientId`). v1: at most one seat per Client; Client may exist before any seat is bound.
_Avoid_: Membership table, teammate invites, WorkOS Organization as the Client identity (for v1)

**Unlinked Client**:
Signed-in User with `role=client` and no `clientId` yet (email has not matched a Client `contactEmail`). Sees a not-linked screen, not Operator Home and not a guessed Workspace.
_Avoid_: Falling back to fixture Clients; treating Unlinked as Operator

### Conventions to match

- Package manager: **Bun** (`bun run …`). Prefer Bun over npm/pnpm.
- Convex: always `args` + `returns` validators on public functions; `await` all DB/scheduler calls; use indexes not `.filter()`; thin wrappers + helpers in `lib/`.
- Auth wrappers: extend `packages/backend/convex/lib/functions.ts` pattern (`authedQuery` / `authedMutation`).
- Portal UI is **French** (copy already FR) — keep FR for new screens.
- Import API as `import { api } from "@hezaerd/backend/api"` (package export `./api`).
- Use `useQuery` / `useMutation` from `convex/react` inside client components under `PortalConvexProvider`.
- Commits: Conventional Commits; scopes from `apps/*` / `packages/*` folder names (`portal`, `backend`) or omit scope for multi-package / root docs. Example: `feat(backend): add clients table and portal role`.
- Development Convex: `bun run dev:backend` / `npx convex dev` from `packages/backend` — **never** `convex deploy` for local work.

## Commands you will need

| Purpose | Command | Expected on success |
| ------- | ------- | ------------------- |
| Install | `bun install` | exit 0 |
| Backend codegen / sync | `bun run --filter @hezaerd/backend codegen` (or keep `convex dev` running) | generates `_generated`; exit 0 |
| Typecheck all | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Format check | `bun run format` | exit 0 |
| Portal typecheck | `bun run --filter @hezaerd/portal typecheck` | exit 0 |
| Backend typecheck | `bun run --filter @hezaerd/backend typecheck` | exit 0 |
| Full check | `bun run check` | exit 0 |

There is **no** automated test suite under `packages/backend` today. Do not invent a Jest/Vitest harness in this plan. Verification is typecheck + lint + manual checklist below.

## Suggested executor toolkit

- Convex skills if available: `schema-builder`, `function-creator`, `auth-setup` (for extending webhook sync — do not replace WorkOS AuthKit).
- Domain: keep names aligned with `apps/portal/CONTEXT.md` after you add the three terms above.
- Prefer Bun for all scripts.

## Scope

**In scope** (only these paths should change):

- `apps/portal/CONTEXT.md` — add Client slug / Client seat / Unlinked Client
- `apps/portal/docs/adr/0002-client-access-and-slug-urls.md` — create (see Step 1)
- `packages/backend/convex/schema.ts`
- `packages/backend/convex/auth.ts` — set role + attempt seat bind on create/update
- `packages/backend/convex/lib/users.ts` — helpers for role/bind
- `packages/backend/convex/lib/functions.ts` — add `operatorQuery` / `operatorMutation` (or equivalent)
- `packages/backend/convex/lib/clients.ts` — create (slug normalize, uniqueness, bind helper)
- `packages/backend/convex/clients.ts` — create (list/get/create/setFeature)
- `packages/backend/convex/users.ts` — extend `me` return shape; add `ensureAccess` mutation
- `packages/backend/.env.example` — document `OPERATOR_EMAILS` (name only; example value may be the public operator email)
- `apps/portal/src/lib/portal-fixtures.ts` — **delete** after callers removed
- `apps/portal/src/lib/portal-role.ts` — rewrite to use Convex `users.me` (or replace with hooks)
- `apps/portal/src/lib/portal-types.ts` — create if needed for Needs Attention / Client view types without fixtures
- `apps/portal/src/lib/use-portal-auth.ts` — stop using `VITE_PORTAL_ROLE` as sandbox signal
- `apps/portal/src/vite-env.d.ts` — remove `VITE_PORTAL_ROLE`
- `apps/portal/.env.example` — remove `VITE_PORTAL_ROLE`
- Portal routes/shells listed under Current state that import fixtures/role
- `apps/portal/src/routes/unlinked.tsx` (or equivalent path) — not-linked screen
- `plans/README.md` — status row for 003

**Out of scope** (do NOT touch):

- Invoices, Files storage, Website editable fields, Insights analytics pipeline, Message persistence
- Persisted Needs Attention / Feature-unlock rows (Client Home stays empty / “all caught up”)
- WorkOS Organizations, WorkOS role claims, Directory Sync
- Brand / Portfolio apps
- Migrating fixture Clients (River Cafe / Northside) into Convex — Operators create real Clients
- `convex deploy` to production
- Multi-seat invites / membership tables
- Changing dual-shell chrome ADR (`0001`) behavior

## Git workflow

- Branch: `advisor/003-portal-client-access` (or `feat/portal-client-access`)
- Commit per logical unit with Conventional Commits, e.g.:
  - `docs(portal): define client slug and seat in glossary`
  - `feat(backend): add clients table and operator access`
  - `feat(portal): replace fixtures with convex clients`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Drift check

Run the drift check in the executor banner. Confirm excerpts still match.

**Verify**: `git rev-parse --short HEAD` prints a SHA; if in-scope files differ from `934d8bc`, open them and reconcile before coding. On contradiction with this plan’s excerpts → STOP.

### Step 1: Record glossary + ADR

1. Update `apps/portal/CONTEXT.md` with **Client slug**, **Client seat**, **Unlinked Client** (wording in Current state).
2. Create `apps/portal/docs/adr/0002-client-access-and-slug-urls.md` summarizing:
   - App-owned `users.role` + optional `users.clientId` (not WorkOS orgs in v1)
   - Operator allowlist via Convex env `OPERATOR_EMAILS` (sole entry: `hezaerd@hezaerd.com`)
   - Slug as public Client key in URLs
   - Auto-bind seat by exact unique `contactEmail` match
   - Client may exist before seat

Keep ADR short (same spirit as `0001-dual-shell-hard-switch.md`).

**Verify**: `rg -n "Client slug|Client seat|Unlinked Client" apps/portal/CONTEXT.md` shows all three; ADR file exists.

### Step 2: Schema

In `packages/backend/convex/schema.ts`:

1. Add `clients` table:

```ts
clients: defineTable({
  name: v.string(),
  slug: v.string(),
  contactEmail: v.string(),
  features: v.object({
    insights: v.boolean(),
    website: v.boolean(),
  }),
})
  .index("by_slug", ["slug"])
  .index("by_contactEmail", ["contactEmail"]),
```

2. Extend `users` with:

```ts
role: v.union(v.literal("operator"), v.literal("client")),
clientId: v.optional(v.id("clients")),
```

**Schema migration note**: Existing `users` rows lack `role`. You MUST backfill in Step 3 (`ensureAccess` / webhook) so old rows get `role` before any query assumes it. Until backfill runs, validators that require `role` will fail for stale rows — prefer making `ensureAccess` the first mutation Portal calls after auth.

**Verify**: With `convex dev` running (or `bun run --filter @hezaerd/backend codegen`), `bun run --filter @hezaerd/backend typecheck` exits 0.

### Step 3: Access helpers + webhook + `ensureAccess`

1. Add `packages/backend/convex/lib/clients.ts` helpers:
   - `normalizeSlug(input: string): string` — lowercase, trim, spaces→`-`, allow `[a-z0-9-]` only; reject empty
   - `normalizeEmail(email: string): string` — trim + lowercase
   - `getClientBySlug`, `assertUniqueSlug`, `assertUniqueContactEmail`
   - `tryBindSeatByEmail(ctx, userId, email)` — if exactly one Client has that `contactEmail` and no other user already holds that `clientId`, patch `users.clientId`; no-op otherwise

2. Operator allowlist helper (in `lib/users.ts` or `lib/clients.ts`):
   - Read `process.env.OPERATOR_EMAILS` (Convex dashboard / `bunx convex env set OPERATOR_EMAILS hezaerd@hezaerd.com`)
   - Split on commas; normalize; membership check
   - Default for this product: only `hezaerd@hezaerd.com`

3. `resolveRole(email)` → `operator` if allowlisted, else `client`.

4. Update AuthKit `user.created` / `user.updated` in `auth.ts` to set `role` and call `tryBindSeatByEmail` after insert/patch. On create, always set `role`. Do not delete `clientId` on unrelated profile updates unless email changed and no longer matches (if email changes: clear `clientId` then re-run bind).

5. Export `users.ensureAccess` as `authedMutation`:
   - Loads app user; if missing → throw clear error (“User profile not synced yet”)
   - Sets `role` from allowlist
   - Runs seat bind
   - Returns updated user (same shape as `me`)

6. Extend `users.me` `returns` validator with `role` and optional `clientId`.

7. Add `operatorQuery` / `operatorMutation` wrappers that call `requireAppUser` then throw if `user.role !== "operator"`.

8. Document in `packages/backend/.env.example`:

```bash
# Comma-separated Operator emails (Convex deployment env, not Vite)
# OPERATOR_EMAILS=hezaerd@hezaerd.com
```

**Verify**: `bun run --filter @hezaerd/backend typecheck` exits 0. Manually: set `OPERATOR_EMAILS` on the Convex **dev** deployment; sign in as operator email; `ensureAccess` then `me` returns `role: "operator"`.

### Step 4: Clients API

Create `packages/backend/convex/clients.ts`:

| Function | Kind | Auth | Behavior |
| -------- | ---- | ---- | -------- |
| `list` | query | operator | All clients, ordered by name (collect OK — practice-scale) |
| `getBySlug` | query | authed | Operator: any slug. Client: only if `user.clientId` matches that Client. Else throw Unauthorized / return null per error-handling norms (prefer throw Unauthorized for wrong Client; return null for unknown slug) |
| `create` | mutation | operator | args: `name`, `slug`, `contactEmail`; Features default `{ insights: false, website: false }`; enforce unique slug + unique contactEmail; normalize email/slug |
| `setFeature` | mutation | operator | args: `slug`, `feature: "insights"\|"website"`, `enabled`; patch features; **do not** create Needs Attention |

Also add a small query used by Operator Home cockpit, e.g. `stats` or compute in `list`:

- `activeClients: clients.length`
- `openInvoiceTotal: 0`, `paidThisMonth: 0`, `clientsWaiting: 0`

**Verify**: From Convex dashboard or a temporary call via portal, operator can create a Client and `list` returns it. Duplicate slug/contactEmail throws a clear Error message.

### Step 5: Portal auth/role wiring

1. Replace `portal-role.ts` with hooks/helpers driven by `api.users.me` (after calling `ensureAccess` once on authenticated entry — e.g. in root layout effect or index route). Suggested shape:
   - `usePortalViewer()` → `{ user, role, clientSlug, isOperator, isClient, isUnlinked, loading }`
   - Client users: resolve slug via `api.clients.getBySlug` only after you have `clientId` — either store slug on user response (join in `me`) **or** add `clients.getMine` returning the bound Client. Prefer `clients.getMine` (authed; returns Client or null) to avoid exposing Id in the URL layer incorrectly.

   **Recommended `me` enrichment (simpler for Portal):** have `users.me` / `ensureAccess` return `{ …user fields, role, clientId, clientSlug: string | null }` by joining the Client when `clientId` set. Keeps redirects easy.

2. Remove `VITE_PORTAL_ROLE` from `vite-env.d.ts` and `.env.example`.

3. Fix `use-portal-auth.ts` sandbox detection to use **only** `VITE_WORKOS_CLIENT_ID` (remove the `VITE_PORTAL_ROLE !== undefined` branch).

4. `routes/index.tsx` redirect logic:
   - loading → spinner
   - no WorkOS user → login
   - operator → `/op`
   - client with slug → `/w/$clientId` with that slug
   - client without slug → `/unlinked` (or chosen path)

5. `routes/op/route.tsx`: if viewer is Client role → redirect to their workspace or `/unlinked` (never show Operator shell).

**Verify**: `rg -n "VITE_PORTAL_ROLE" apps/portal` returns no matches (except maybe historical plans — should be none under `apps/portal`). `bun run --filter @hezaerd/portal typecheck` exits 0.

### Step 6: Replace fixture reads in Operator + Workspace UI

1. Delete usages of `portal-fixtures` one file at a time; introduce a shared Portal Client view type (slug as `id` for route params **or** rename params mentally: route param stays `$clientId` but value is slug — keep param name for less churn).

2. Operator Home (`op/index.tsx`): `useQuery(api.clients.list)` + cockpit zeros/activeClients.

3. Clients directory: list + **create form** (name, slug, contactEmail). On submit → `clients.create` → navigate to `/op/clients/$clientId`.

4. Client record: load by slug; Feature toggles call `setFeature`; remove local `useState` fixture refresh hack.

5. Workspace switcher + `w/$clientId/*` loaders: `getBySlug`; 404 via `notFound()` when null.

6. Client Home Needs Attention: pass `[]` (empty). Keep `NeedsAttentionList` component; move its types out of fixtures into `portal-types.ts` before deleting fixtures.

7. Delete `apps/portal/src/lib/portal-fixtures.ts` when `rg portal-fixtures apps/portal` is empty.

**Verify**:

```bash
rg -n "portal-fixtures" apps/portal
# → no matches
bun run --filter @hezaerd/portal typecheck
bun run lint
```

### Step 7: Unlinked screen

Add route (e.g. `apps/portal/src/routes/unlinked.tsx`) with French copy:

- Signed in but Workspace not ready
- Contact Hezaerd / practice email
- No link into `/op` or fake Clients

Wire from index redirect (Step 5).

**Verify**: Sign in as a non-allowlisted email that matches no `contactEmail` → lands on unlinked screen. Operator email → `/op`.

### Step 8: Manual end-to-end checklist

With `bun run dev:backend` and `bun run dev:portal`, WorkOS + `VITE_CONVEX_URL` configured, `OPERATOR_EMAILS=hezaerd@hezaerd.com` on Convex:

1. Sign in as `hezaerd@hezaerd.com` → Operator Home; cockpit activeClients updates when you create Clients; money tiles 0.
2. Create Client (name/slug/contactEmail) → appears in list; open Workspace by slug URL.
3. Toggle Features → nav Insights/Website appear/disappear after reload/reactivity.
4. Client Home shows calm empty state (no fixture attention items).
5. Sign in as another user whose email equals that Client’s `contactEmail` → auto-bound → Client Workspace for that slug; no Workspace Switcher.
6. Sign in as unrelated email → Unlinked screen.
7. Unknown slug `/w/does-not-exist` → not found.

**Verify**: All seven behaviors observed. `bun run check` exits 0.

### Step 9: Index

Update `plans/README.md` row for 003 to `DONE` (or leave `IN PROGRESS` if handing off mid-flight). Add dependency note that Invoices / Needs Attention plans should build on this Client model.

**Verify**: README table shows 003 status correctly.

## Test plan

No unit-test runner in backend today. Do **not** add a framework in this plan.

Characterization instead:

- Typecheck gates above
- Manual checklist in Step 8 (treat as acceptance tests)
- Optional later follow-up: Convex-helpers test harness — out of scope

## Done criteria

Machine-checkable / observable. ALL must hold:

- [ ] `bun run check` exits 0
- [ ] `rg -n "portal-fixtures" apps/portal` → no matches
- [ ] `rg -n "VITE_PORTAL_ROLE" apps/portal` → no matches
- [ ] `packages/backend/convex/schema.ts` defines `clients` + `users.role` + optional `users.clientId`
- [ ] Public Convex functions used by Portal declare `args` and `returns`
- [ ] `apps/portal/CONTEXT.md` contains Client slug, Client seat, Unlinked Client
- [ ] ADR `apps/portal/docs/adr/0002-client-access-and-slug-urls.md` exists
- [ ] Manual Step 8 checklist passed
- [ ] No files outside Scope modified (`git status` review)
- [ ] `plans/README.md` status row for 003 updated

## STOP conditions

Stop and report back (do not improvise) if:

- Drift check shows schema/auth/portal-role excerpts no longer match and the new code conflicts with this plan’s decisions.
- WorkOS AuthKit component API prevents setting custom fields on `users` from webhooks (try `ensureAccess`-only backfill first; if AuthKit owns the table exclusively, STOP).
- Making `users.role` required breaks existing deployments and there is no safe backfill path without `convex deploy` to prod (dev backfill only is expected — do not prod-deploy).
- You believe Needs Attention or Invoices must be implemented for Client Home / cockpit to compile — they must not; use empty list and zeros.
- Duplicate `contactEmail` / slug rules conflict with a product change request not in this plan.
- A step’s verification fails twice after a reasonable fix attempt.
- Fix appears to require editing Brand/Portfolio or replacing AuthKit.

## Maintenance notes

- **Next slices** (separate plans): Needs Attention derivation; Invoices + Pay (feeds cockpit money + waiting); Files + File requests; Website fields; Insights; Message; optional WorkOS role claims replacing email allowlist when hiring staff.
- **Reviewer focus**: authorization on `getBySlug` (Client must not read other Clients); slug uniqueness; email normalization consistency; no fixture leftovers; Operator allowlist only on server (never trust Vite env for role).
- **Env**: `OPERATOR_EMAILS` is a Convex deployment env var. Changing Operator email means updating Convex env, not Portal Vite env.
- **Slug renames**: not supported in this plan; if needed later, add redirects.
- Fixture deletion cue from plan 002 is satisfied when this plan lands.
