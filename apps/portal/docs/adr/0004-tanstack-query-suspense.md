# ADR 0004: TanStack Query + Suspense for Portal Convex reads

## Status

Accepted — 2026-07-27

## Context

Portal navigation felt sluggish: most routes used raw `convex/react` `useQuery`, blocking on `data === undefined` and showing plain `"Chargement…"` on every navigation. A partial `convex-helpers/react/cache` setup existed only on operator home.

## Decision

- **Convex reads** use `@convex-dev/react-query` with TanStack Query:
  - Query factories in `apps/portal/src/lib/convex-queries.ts`
- Components use `useSuspenseQuery`
- Layout shells wrap `<Outlet />` in `<Suspense fallback={skeleton}>`
- **Route loaders must not call `ensureQueryData` on authenticated queries** — loaders run before WorkOS attaches the Convex token. Use `usePrefetchWhenAuthenticated` in layout components after session is ready.
- **Auth/session gates** stay imperative (`usePortalSession`, `PortalSpinner`) — not Suspense.
- **Mutations and actions** stay on `convex/react` (`useMutation`, `useAction`). Convex pushes query updates; no manual `invalidateQueries`.
- Router uses `setupRouterSsrQueryIntegration` + shared `QueryClient` from `getPortalQueryClient()`.

## Consequences

- Instant back-navigation via Query cache (`gcTime` default 5 min).
- New data routes must follow: factory → loader → `useSuspenseQuery` → Suspense boundary. No per-page `if (loading)` gates.
- `convex-helpers/react/cache` removed from portal; backend may still use `convex-helpers` server utilities.
