# Plan 002: Migrate Portal Convex reads to TanStack Query + Suspense

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 9f5bc2b..HEAD -- apps/portal/src apps/portal/package.json apps/portfolio/src/router.tsx apps/portfolio/src/components/spotify/spotify-stats-grid.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `9f5bc2b`, 2026-07-27
- **Completed at**: 2026-07-27

## Why this matters

Portal navigation flashes a plain `"Chargement…"` on most route changes because reads use raw `convex/react` `useQuery` with no client cache across unmount, and every page blocks on `data === undefined`. Operator home partially uses `convex-helpers/react/cache` + a skeleton; the rest of the app does not.

The target is the TanStack Start pattern already used in portfolio: **route loaders seed the Query cache**, **`useSuspenseQuery` in components** (no per-page loading gates), and **`<Suspense fallback={…}>` boundaries** keep shell chrome visible while content loads. Auth/session gates stay imperative (WorkOS + `ensureAccess` + redirects) — they are outside the Suspense tree.

**Do not run `convex-helpers/react/cache` and `@convex-dev/react-query` for the same Convex query after migration.** Remove `ConvexQueryCacheProvider` in the cleanup step.

## Current state

### Relevant files

- `apps/portal/src/components/convex-provider.tsx` — `ConvexProviderWithAuth` + `ConvexQueryCacheProvider` (remove cache provider in cleanup)
- `apps/portal/src/router.tsx` — no `QueryClient`, no SSR query integration
- `apps/portal/src/routes/__root.tsx` — plain `createRootRoute` (needs router context)
- `apps/portal/src/lib/portal-session.ts` — session gate; `useQuery(api.users.me, …)` on `convex/react`
- `apps/portal/src/routes/op/index.tsx` — only route using `convex-helpers/react/cache` + `OperatorHomeSkeleton`
- `apps/portfolio/src/router.tsx` — exemplar for `QueryClient` + `setupRouterSsrQueryIntegration`
- `apps/portfolio/src/routes/index.tsx` — exemplar for route `loader` + `ensureQueryData`
- `apps/portfolio/src/components/spotify/spotify-stats-grid.tsx` — exemplar for `useSuspenseQuery` + nested `<Suspense>`

### Excerpts (confirm before editing)

Router has no query integration (`apps/portal/src/router.tsx`):

```5:11:apps/portal/src/router.tsx
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
```

Convex cache provider today (`apps/portal/src/components/convex-provider.tsx`):

```19:24:apps/portal/src/components/convex-provider.tsx
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromWorkOS}>
        <ConvexQueryCacheProvider>{children}</ConvexQueryCacheProvider>
      </ConvexProviderWithAuth>
    </AuthKitProvider>
```

Typical data-route loading gate to remove (`apps/portal/src/routes/op/clients/$clientId/invoices.tsx`):

```17:30:apps/portal/src/routes/op/clients/$clientId/invoices.tsx
function ClientDeskInvoicesPage() {
  const { clientId } = Route.useParams();
  const invoices = useQuery(api.invoices.listByClientSlug, { slug: clientId });
  ...
  if (invoices === undefined) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </div>
    );
  }
```

Portfolio Suspense exemplar (`apps/portfolio/src/components/spotify/spotify-stats-grid.tsx`):

```19:19:apps/portfolio/src/components/spotify/spotify-stats-grid.tsx
import { useSuspenseQuery } from "@tanstack/react-query";
```

### Convex read inventory (all migrate to `useSuspenseQuery`)

| Query | Used in |
| --- | --- |
| `api.users.me` | `lib/portal-session.ts` — **keep imperative `useQuery` + `enabled` (not Suspense)** |
| `api.clients.list` | `routes/op/index.tsx`, `routes/op/clients/index.tsx` |
| `api.clients.stats` | `routes/op/index.tsx` |
| `api.clients.getBySlug` | `routes/op/clients/$clientId/route.tsx`, `routes/w/$clientId/route.tsx`, `routes/w/$clientId/index.tsx`, `routes/w/$clientId/website.tsx`, `routes/w/$clientId/insights.tsx`, `routes/op/clients/$clientId/index.tsx` |
| `api.invoices.listAll` | `routes/op/invoices.tsx` |
| `api.invoices.listByClientSlug` | `routes/op/clients/$clientId/invoices.tsx` |
| `api.invoices.listWaitingOnClient` | `routes/op/clients/$clientId/index.tsx` |
| `api.invoices.listNeedsAttention` | `routes/w/$clientId/index.tsx` |
| `api.invoices.listForWorkspace` | `routes/w/$clientId/invoices.tsx` |

### Mutations / actions (stay on `convex/react`)

| API | Used in |
| --- | --- |
| `api.users.ensureAccess` | `portal-session.ts` |
| `api.clients.create`, `setFeature` | `op/clients/*` |
| `api.invoices.create`, `send`, `cancel`, `markPaidBankWire` | invoice routes |
| `api.invoiceCheckout.startCheckout` | `w/$clientId/invoices.tsx` |

Stub routes with no Convex reads (skip): `op/clients/$clientId/{files,website,insights}.tsx`, `w/$clientId/files.tsx`.

### Conventions

- Package manager: **Bun**. App: `@hezaerd/portal` (TanStack Start + Vite, port 3002).
- UI language: **French** for user-facing copy.
- Components: `@hezaerd/ui` + Hugeicons — match existing shell density (`operator-shell.tsx`, `operator-home-skeleton.tsx`).
- Loading UX: **Suspense fallbacks = skeletons** inside shell chrome; **auth gates = centered `Spinner`** (full-page, once per session).
- Commits: Conventional Commits, scope `portal`. Example: `feat(portal): wire tanstack query suspense for operator routes`.
- No automated Portal UI test suite — verification is typecheck/lint + grep + manual checklist below.

## Commands you will need

| Purpose | Command | Expected on success |
| --- | --- | --- |
| Install | `bun install` | exit 0 |
| Portal typecheck | `bun run --filter @hezaerd/portal typecheck` | exit 0, no errors |
| Monorepo typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Dev smoke | `bun run --filter @hezaerd/portal dev` | app serves on port 3002 |
| Cache grep | `rg 'convex-helpers/react/cache|ConvexQueryCacheProvider' apps/portal` | no matches after cleanup |
| Loading gate grep | `rg 'Chargement…' apps/portal/src/routes` | no matches in data routes after Step 5 |

## Suggested executor toolkit

- Read `.agents/skills/shadcn/SKILL.md` when adding skeleton components — use `Skeleton`, `Spinner`; no custom `animate-pulse` divs.
- Convex adapter docs: https://docs.convex.dev/client/tanstack/tanstack-query/

## Scope

**In scope** (only files you should modify or create):

- `apps/portal/package.json`
- `apps/portal/src/router.tsx`
- `apps/portal/src/routes/__root.tsx`
- `apps/portal/src/components/convex-provider.tsx`
- `apps/portal/src/lib/convex-client.ts` (create)
- `apps/portal/src/lib/convex-queries.ts` (create)
- `apps/portal/src/lib/portal-session.ts`
- `apps/portal/src/components/shell/portal-spinner.tsx` (create)
- `apps/portal/src/components/shell/*-skeleton.tsx` (create as needed)
- `apps/portal/src/routes/index.tsx`, `unlinked.tsx`
- `apps/portal/src/routes/op/**`
- `apps/portal/src/routes/w/$clientId/**`
- `apps/portal/docs/` or ADR note (create, one short doc)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch):

- `packages/backend/convex/**` — no schema or function changes needed
- Invoice/Files/Website **product features** — loading architecture only
- Migrating mutations to TanStack `useMutation`
- React Query DevTools, view transitions, link-hover prefetch
- `apps/portfolio/**` — reference only, do not modify

## Git workflow

- Branch: `advisor/002-portal-tanstack-query` (or equivalent)
- One commit per step (or per logical group within a step)
- Do NOT push or open a PR unless the operator instructed it

## Target architecture

```
AuthKitProvider
└── ConvexProviderWithAuth (WorkOS — unchanged)
    └── QueryClientProvider
        └── Routes
            ├── Auth gates (imperative Spinner — outside Suspense)
            └── Shell chrome (OperatorShell / ClientWorkspaceShell)
                └── <Suspense fallback={<PageSkeleton />}>
                      └── <Outlet />  → useSuspenseQuery in leaf routes
```

**Data flow per navigation:**

1. Route `loader` calls `queryClient.ensureQueryData(convexQueryFactory(...))`
2. Leaf component calls `useSuspenseQuery(sameFactory(...))` — no `if (loading)` branch
3. If loader did not run (client nav edge), Suspense boundary shows skeleton until subscription resolves

**Session query exception:** `portal-session.ts` uses imperative `useQuery({ ...portalMeQuery, enabled })` because auth gating is a state machine (WorkOS → `ensureAccess` → `me` → redirect), not a Suspense boundary.

---

## Steps

### Step 1: Add dependencies

Add to `apps/portal/package.json`:

```json
"@convex-dev/react-query": "^0.1.0",
"@tanstack/react-query": "^5.101.4",
"@tanstack/react-router-ssr-query": "^1.167.1"
```

Run `bun install` at repo root. Pin `@convex-dev/react-query` to latest version compatible with `convex@^1.31.6` if the caret resolves to something broken.

**Verify**: `bun install` → exit 0.

### Step 2: Shared clients + query factories

Create `apps/portal/src/lib/convex-client.ts`:

- Move singleton `ConvexReactClient` construction from `convex-provider.tsx`
- Export `convex`, `convexQueryClient` (`ConvexQueryClient | null`)

Create `apps/portal/src/lib/convex-queries.ts`:

- One `queryOptions({ ...convexQuery(api.fn, args) })` factory per row in the read inventory (except `users.me` which is exported as `portalMeQuery`)
- Pattern:

```ts
import { convexQuery } from "@convex-dev/react-query";
import { queryOptions } from "@tanstack/react-query";
import { api } from "@hezaerd/backend/api";

export function invoicesByClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listByClientSlug, { slug }),
  });
}
```

**Verify**: `bun run --filter @hezaerd/portal typecheck` → exit 0.

### Step 3: Router + root context + providers

Update `apps/portal/src/router.tsx` (mirror portfolio, but with Convex adapter):

```ts
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { convex } from "@/lib/convex-client";

const convexQueryClient = new ConvexQueryClient(convex!);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      gcTime: 5 * 60 * 1000,
    },
  },
});
convexQueryClient.connect(queryClient);
```

- Pass `context: { queryClient }` to `createTanStackRouter`
- Set `defaultPreloadStaleTime: 30_000`
- Call `setupRouterSsrQueryIntegration({ router, queryClient })`
- Export `queryClient` for the provider (same instance)

Update `apps/portal/src/routes/__root.tsx`:

- `createRootRouteWithContext<{ queryClient: QueryClient }>()`
- Export `RouterContext` type

Update `apps/portal/src/components/convex-provider.tsx`:

- Wrap children in `QueryClientProvider` with the shared `queryClient`
- **Keep** `ConvexQueryCacheProvider` until Step 8 (temporary coexistence during migration — do not query the same function through both)

Wire provider to receive `queryClient` from router bootstrap (match how TanStack Start instantiates `getRouter()` — read the app entry if needed).

**Verify**: `bun run --filter @hezaerd/portal typecheck` → exit 0. Dev server starts without provider errors.

### Step 4: Session layer (imperative — not Suspense)

In `apps/portal/src/lib/portal-session.ts`:

- Replace `useQuery` from `convex/react` with `useQuery` from `@tanstack/react-query` + `portalMeQuery` + `enabled`
- Loading: `viewerLoading = Boolean(workos.user) && convexConfigured && (!accessReady || (mePending && me === undefined))`
- Keep `ensureAccess` on `convex/react`

Replace `"Chargement…"` in auth gate routes with `PortalSpinner` (create in Step 5):

- `routes/index.tsx`, `routes/unlinked.tsx`, `routes/op/route.tsx`, `routes/w/$clientId/route.tsx` (auth portions only)

**Verify**: cold load → login → `/op` resolves; client role still redirects correctly.

### Step 5: Skeleton + spinner components

Create:

- `apps/portal/src/components/shell/portal-spinner.tsx` — centered `@hezaerd/ui` `Spinner` + optional `"Chargement…"` label
- `apps/portal/src/components/shell/client-desk-layout-skeleton.tsx`
- `apps/portal/src/components/shell/invoice-list-skeleton.tsx`
- `apps/portal/src/components/shell/client-list-skeleton.tsx`
- Reuse existing `operator-home-skeleton.tsx` for operator home Suspense fallback

Model skeleton structure on real page layout (match card rows, header blocks — see `operator-home-skeleton.tsx`).

**Verify**: components render in isolation (import in a temp route or Storybook-free manual check in dev).

### Step 6: Suspense boundaries in layouts

After auth gate passes, wrap `<Outlet />` in Suspense inside shell layouts:

**Operator shell** — in `apps/portal/src/routes/op/route.tsx`, inside `<OperatorShell>`:

```tsx
import { Suspense } from "react";

<OperatorShell email={...}>
  <Suspense fallback={<OperatorHomeSkeleton />}>
    <Outlet />
  </Suspense>
</OperatorShell>
```

Use route-appropriate fallbacks where the outlet serves heterogeneous pages — options:

- Generic `PageContentSkeleton` for mixed outlet, or
- Per-parent-route Suspense (preferred for client desk — see below)

**Client desk layout** — in `apps/portal/src/routes/op/clients/$clientId/route.tsx`:

- Migrate layout to `useSuspenseQuery(clientBySlugQuery(clientId))` (no loading gate)
- Wrap `<Outlet />` in `<Suspense fallback={<InvoiceListSkeleton />}>` or a desk-specific content skeleton
- Handle `clientDoc === null` with `notFound()` after suspense resolves

**Client workspace layout** — in `apps/portal/src/routes/w/$clientId/route.tsx`:

- After workspace gate passes, wrap shell outlet in Suspense with workspace content skeleton

**Verify**: navigating between sidebar items keeps sidebar visible; content area shows skeleton instead of full-page blank.

### Step 7: Route loaders + `useSuspenseQuery` on data routes

For each data route, add a `loader` that calls `ensureQueryData`, then replace component reads with `useSuspenseQuery`. **Remove all `if (data === undefined)` / `"Chargement…"` gates.**

Order (parents before children):

| Route file | Loader ensures | Component queries |
| --- | --- | --- |
| `routes/op/index.tsx` | `clientsListQuery`, `clientsStatsQuery` | same, via `useSuspenseQuery` |
| `routes/op/clients/index.tsx` | `clientsListQuery` | same |
| `routes/op/invoices.tsx` | `invoicesAllQuery` | same |
| `routes/op/clients/$clientId/route.tsx` | `clientBySlugQuery(clientId)` | same (layout) |
| `routes/op/clients/$clientId/index.tsx` | `clientBySlugQuery`, `waitingOnClientQuery` | same |
| `routes/op/clients/$clientId/invoices.tsx` | `invoicesByClientQuery` | same |
| `routes/w/$clientId/route.tsx` | `clientBySlugQuery` when loading client | same |
| `routes/w/$clientId/index.tsx` | `clientBySlugQuery`, `needsAttentionQuery` | same |
| `routes/w/$clientId/invoices.tsx` | `invoicesForWorkspaceQuery` | same |
| `routes/w/$clientId/website.tsx`, `insights.tsx` | `clientBySlugQuery` | same |

Loader pattern (exemplar):

```ts
export const Route = createFileRoute("/op/clients/$clientId/invoices")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(invoicesByClientQuery(params.clientId)),
  component: ClientDeskInvoicesPage,
});

function ClientDeskInvoicesPage() {
  const { clientId } = Route.useParams();
  const { data: invoices } = useSuspenseQuery(invoicesByClientQuery(clientId));
  // no loading branch — render directly
}
```

Set `pendingMs: 200` on routes where sub-200ms skeleton flash is distracting.

**Verify** after each group:

- `bun run --filter @hezaerd/portal typecheck` → exit 0
- `rg 'Chargement…' apps/portal/src/routes/op/clients/$clientId/invoices.tsx` → no matches
- Manual: navigate `/op` → `/op/clients` → `/op/clients/{slug}/invoices` → back — sidebar stays; second visit feels instant

### Step 8: Cleanup

1. Remove `ConvexQueryCacheProvider` from `convex-provider.tsx`
2. Remove all `convex-helpers/react/cache` imports from portal
3. Remove `convex-helpers` from `apps/portal/package.json` if no longer imported
4. Add `apps/portal/docs/adr/0004-tanstack-query-suspense.md` (or equivalent): Convex reads → TQ + Suspense; mutations/actions → `convex/react`; auth gates → imperative
5. Update `plans/README.md` status → DONE

**Verify**:

```bash
bun run --filter @hezaerd/portal typecheck
rg 'convex-helpers/react/cache|ConvexQueryCacheProvider' apps/portal
rg 'from "convex/react"' apps/portal  # expect mutations/actions only
rg 'useQuery\(api\.' apps/portal/src/routes  # expect no raw convex useQuery in routes
rg 'Chargement…' apps/portal/src/routes  # expect no matches in data routes
```

---

## Test plan

Manual (no automated UI suite):

- [ ] Cold load: `/` → auth → `/op` — `PortalSpinner` once, then operator home
- [ ] `/op` → `/op/clients` → `/op/invoices` → browser back — sidebar visible throughout; cached pages instant on return
- [ ] `/op/clients/{slug}` → desk sections — desk header persists; content Suspense skeleton on first visit only
- [ ] Client role: `/w/{slug}` areas load under workspace shell
- [ ] Operator visiting `/w/{slug}` still redirects to desk
- [ ] Create/send invoice → list updates live without manual invalidation
- [ ] Hard refresh on a deep link (e.g. `/op/clients/{slug}/invoices`) — SSR/loader hydrates without mismatch error in console

## Done criteria

ALL must hold:

- [ ] `bun run --filter @hezaerd/portal typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `rg 'convex-helpers/react/cache|ConvexQueryCacheProvider' apps/portal` returns no matches
- [ ] All data routes use `useSuspenseQuery` + route `loader`; no `if (=== undefined)` loading gates in route components
- [ ] Auth gate routes use `PortalSpinner`, not `"Chargement…"` plain text
- [ ] Shell layouts wrap `<Outlet />` in `<Suspense fallback={…}>`
- [ ] `plans/README.md` status row updated to DONE
- [ ] No files outside Scope modified (`git diff --name-only` against branch base)

## STOP conditions

Stop and report (do not improvise) if:

- Code at "Current state" excerpts does not match live files (drift).
- `@convex-dev/react-query` fails with `ConvexProviderWithAuth` + WorkOS token bridge.
- SSR hydration mismatch on any loader route — disable that route's loader and report before continuing others.
- `useSuspenseQuery` throws outside a Suspense boundary — fix boundary placement, do not revert to imperative loading gates.
- Same Convex function is queried through both `convex-helpers/cache` and `convexQuery` after Step 3 — stop and remove the duplicate path.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- **New Portal routes with Convex reads:** add factory in `convex-queries.ts`, route `loader` with `ensureQueryData`, component `useSuspenseQuery`, ensure parent layout has Suspense boundary. Do not add `if (data === undefined)` gates.
- **New mutations:** keep `useMutation` / `useAction` from `convex/react` — Convex pushes query updates; no `invalidateQueries`.
- **Auth changes:** keep `portal-session.ts` imperative; do not wrap auth gate in Suspense.
- **Reviewer focus:** provider singleton identity (router vs provider same `queryClient`), no double cache, Suspense boundary placement, French copy unchanged except loading components.
- **Deferred:** TanStack mutation wrappers, DevTools, `defaultViewTransition`, nav link prefetch.

## Out of scope (follow-ups)

- Migrating mutations to TanStack `useMutation` + `useConvexMutation`
- React Query DevTools in dev
- Prefetch on sidebar link hover
- `defaultViewTransition: true`
