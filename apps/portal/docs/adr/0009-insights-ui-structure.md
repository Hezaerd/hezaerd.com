# Insights — UI structure (v1 wireframe)

Calm Client Workspace + mirrored Client Desk. Not a chart wall.

**Status:** accepted

## Layout (both shells, Client gated by `features.insights`)

```
┌─────────────────────────────────────────────────┐
│ Statistiques                                    │
│ [ Aujourd'hui | 7j | 30j | 90j ]   ← défaut 30j │
├─────────────────────────────────────────────────┤
│ VISITEURS                                       │
│ 12 450 (30j) · 420 aujourd'hui                  │
│ ┌─────────────────────────────────────────────┐ │
│ │     area/line chart — daily totals          │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ SOURCES          │  PAGES (top 5)               │
│ horizontal bars  │  table: path · views           │
│ Search 45%       │  ── Landings ──               │
│ Direct  30%      │  table: path · entries         │
│ Social  15%      │  ── Sorties ──                │
│ …                │  table: path · exits           │
├─────────────────────────────────────────────────┤
│ PARCOURS (top 5 routes 2–3 pages)               │
│ / → /services → /contact          124           │
├─────────────────────────────────────────────────┤
│ ACTIONS (si accès client + events)              │
│ table: label · count · top 20 + Autres          │
└─────────────────────────────────────────────────┘
```

## Charts

See [ADR-0011](./0011-insights-chart-stack.md) for library choice and `@hezaerd/ui` primitives.

- **Renderer:** TanStack Charts via `@hezaerd/ui` presets — **not** Recharts.
- **Presets:** `LineChart` (daily visitors), `BarChart` (sources, horizontal).
- Max **one** time-series + **one** bar block. Rest = tables.
- Client Workspace: generous whitespace, max-w-2xl content column (matches existing Insights route).
- Client Desk: same blocks, slightly denser tables (existing Desk tokens).

## UI implementation order

1. **`@hezaerd/ui` chart shell** — fork shadcn coquille (`ChartConfig`, `ChartStyle`, tooltip card); add `@tanstack/react-charts`; wire token bridge.
2. **Presets** — `LineChart` + `BarChart` with mock Convex-shaped data.
3. **Shared Insights blocks** — `packages/ui` or `apps/portal/src/components/insights/`: period picker, stat header, section tables (pages, routes, events).
4. **Wire queries** — TanStack Query + Convex rollups (ADR-0005); plug into blocks.
5. **Routes** — `w/$clientId/insights` (Client, gated) + `op/clients/$clientId/insights` (Desk, always on for `linkedSite`); Operator banner when client access off.

Steps 1–3 can proceed before collector is live (mock data). Step 4 depends on schema + queries.

## Operator-only chrome

When `features.insights === false`:

- Full stats visible on Desk.
- Banner: « Accès client désactivé » + toggle Feature (existing pattern on Desk landing).

When no `linkedSite`:

- Desk Statistiques: empty state « Liez un site pour commencer la collecte ».

## Refresh

- TanStack Query `staleTime: 15 * 60 * 1000` for « Aujourd'hui »; 30/90j can be longer.

## Deferred (not on this screen v1)

- Takeaway block
- Export
- Geo / device
- Comparison vs previous period
