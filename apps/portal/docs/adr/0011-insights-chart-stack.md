# Insights — chart stack (TanStack + coquille shadcn)

Rendering library and `@hezaerd/ui` chart primitives for Insights v1.

**Status:** accepted

## Decision

- **Renderer:** `@tanstack/react-charts` (+ granular `d3-scale` / `d3-array` as needed).
- **UI shell:** fork shadcn `chart` **coquille only** — `ChartConfig`, `ChartStyle`, tooltip/legend styling — **without Recharts**.
- **Recharts:** not added to the monorepo.

Rationale: aligns with TanStack Router/Query/Form; bundle smaller; Insights v1 needs only two chart types. shadcn registry examples compose Recharts JSX inside `ChartContainer` — incompatible with TanStack's `defineChart` model, so we keep tokens + tooltip look, not the Recharts composition pattern.

## `@hezaerd/ui` structure

```
packages/ui/src/components/chart/
  chart-config.tsx       # ChartConfig, ChartStyle, useChart (fork shadcn, no Recharts)
  chart-tooltip.tsx      # generic tooltip card { label, items[] }
  chart-container.tsx    # responsive shell, maps --chart-* → TanStack theme
  presets/
    line-chart.tsx       # daily visitors (lineY / areaY)
    bar-chart.tsx        # sources (horizontal bars)
```

Portal imports **presets only** — never `@tanstack/react-charts` directly in routes.

## Tokens

Existing `--chart-1…5` in `globals.css` stay the source of truth. `ChartStyle` injects `--color-{seriesKey}` per shadcn convention. Container maps to TanStack (`--ts-chart-*` or mark `fill`/`stroke` via `var(--color-*)`).

## Risks

TanStack Charts is pre-alpha (`0.0.x`) — pin version; changes isolated to `packages/ui/components/chart/`.

## Non-goals

- Port shadcn/Recharts example gallery
- Generic `ChartContainer` that accepts Recharts children
- Chart types beyond line + horizontal bar for Insights v1
