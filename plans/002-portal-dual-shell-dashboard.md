# Plan 002: Ship Portal dual-shell dashboard UI (Operator Home + Client Workspace)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 33ed6d2..HEAD -- apps/portal packages/ui docs/adr apps/portal/CONTEXT.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none (plan 001 is DONE and unrelated)
- **Category**: direction
- **Planned at**: commit `33ed6d2`, 2026-07-24

## Why this matters

Portal today is a login gate plus a placeholder “Business overview” page. Product design is already decided in `apps/portal/CONTEXT.md`: a **dual-role** app with a hard switch between **Operator Home** (practice cockpit) and **Client Workspace** (per-Client collaboration shell). Without that chrome and information architecture, every later feature (Invoices, Files, Insights, Website) will land in the wrong place and train the wrong habits.

This plan ships the **UI shell + routes + fixture data** that match the glossary. It does **not** implement real invoicing, file storage, analytics, or CMS backends — those are follow-up plans once the shells exist.

## Current state

### Relevant files

- `apps/portal/CONTEXT.md` — **source of truth for product language and UX rules** (read fully before coding; use these terms in route names, nav labels, and comments)
- `apps/portal/src/routes/index.tsx` — login + placeholder Dashboard (lines 51–80 still say “Business overview” / “products, customers, and sales”)
- `apps/portal/src/routes/__root.tsx` — root layout; Convex provider; `noindex`
- `apps/portal/src/app.css` — Portal tokens (dark green/cream; Bricolage + Source Sans + IBM Plex Mono)
- `packages/ui/` — shared shadcn (base-nova, hugeicons). **No Sidebar yet.** Components import as `@hezaerd/ui/components/<name>`
- `packages/backend/convex/schema.ts` — only `users` table; **no Clients / Invoices / Features**
- `docs/adr/0001-brand-portfolio-boundaries.md` — Brand/Portfolio only; Portal dual-shell not recorded yet

### Excerpt — placeholder Dashboard (replace)

```51:80:apps/portal/src/routes/index.tsx
function Dashboard({ email }: { email: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-8">
      <header className="border-border flex items-center justify-between gap-4 border-b pb-6">
        ...
      </header>
      <main className="flex flex-1 flex-col justify-center py-16">
        <p className="font-display text-xl font-medium tracking-tight">Business overview</p>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          Manage products, customers, and sales for your freelance software business. Modules
          will land here.
        </p>
      </main>
    </div>
  );
}
```

### Excerpt — glossary decisions this UI must honor (do not invent synonyms)

From `apps/portal/CONTEXT.md` (paraphrased for the executor — still open the file):

| Term                   | UI rule                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Operator Home**      | Practice Cockpit (4 tiles) + Client list; hard switch into Workspace                    |
| **Client Workspace**   | Bound to one **Client**; same Area chrome for Client and Operator-in-workspace          |
| **Workspace Switcher** | Operator-only, top bar; list Clients + “Back to Operator Home”; hidden from Clients     |
| **Shell chrome**       | Left sidebar + top bar both shells; Client sparse, Operator denser                      |
| **Operator nav**       | Home · Clients · Invoices · Settings only                                               |
| **Client Areas**       | Home · Invoices · Files · Insights · Website (last two only if Feature on)              |
| **Client Home**        | Needs Attention list only; calm empty = “all caught up”                                 |
| **Client record**      | Operator page: identity, Feature toggles, **Open workspace** CTA — not a mini-workspace |
| **Core**               | Home, Invoices, Files always on                                                         |
| **Feature**            | Insights + Website toggled on Client record; Feature unlock = one Needs Attention       |
| **Labels**             | Insights (not Analytics), Website (not CMS)                                             |
| **v1 seats**           | One login per Client — no teammate invite UI                                            |

### Conventions to match

- Package manager: **Bun**. Prefer `bun` / `bunx --bun`.
- Commits: Conventional Commits — scopes are app/package folder names (`portal`, `ui`). Example from history: `feat(portal): gate home behind login as business dashboard`
- UI components: add via shadcn into `packages/ui` (`cd packages/ui && bunx --bun shadcn@latest add <name> -y`), then import from `@hezaerd/ui/components/...` (see `apps/portfolio/src/components/navbar.tsx`).
- Empty states: use `@hezaerd/ui/components/empty` (already installed), not custom empty markup.
- Portal styling: keep existing CSS variables in `apps/portal/src/app.css`; use semantic tokens (`bg-background`, `text-muted-foreground`, `font-display`). Do not introduce a purple SaaS theme.
- Auth: keep WorkOS `useAuth` gate; unauthenticated users still see login on `/`.

### Role / data assumption (fixture-first)

There is **no** Operator vs Client role in Convex/WorkOS yet, and **no** Client table. This plan uses a local fixture module so the dual shell is buildable and clickable:

- `apps/portal/src/lib/portal-fixtures.ts` — mock Clients, Feature flags, Needs Attention items, cockpit numbers, Messages cue.
- Role resolution for v1 UI:
  1. If `import.meta.env.VITE_PORTAL_ROLE` is `"operator"` or `"client"`, use it.
  2. Else treat signed-in users as **Operator** (current real users are the practice owner building the app).
  3. Client shell is always reachable for Operators via **Open workspace** / Workspace Switcher using fixture Client ids.
  4. When `VITE_PORTAL_ROLE=client`, land directly in the first fixture Client Workspace and **hide** Workspace Switcher + Operator routes (redirect `/op/*` → workspace Home).

Document the env var in `apps/portal/.env.example` (name + allowed values only — never paste secrets).

## Commands you will need

| Purpose           | Command                                                                   | Expected on success                               |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| Install           | `bun install` (repo root)                                                 | exit 0                                            |
| Add UI component  | `cd packages/ui && bunx --bun shadcn@latest add <names> -y`               | files under `packages/ui/src/components/`; exit 0 |
| Typecheck portal  | `bun run --filter @hezaerd/portal typecheck`                              | exit 0                                            |
| Typecheck ui      | `bun run --filter @hezaerd/ui typecheck`                                  | exit 0                                            |
| Lint              | `bun run lint` (repo root)                                                | exit 0                                            |
| Format check      | `bun run format`                                                          | exit 0                                            |
| Dev portal        | `bun run dev:portal`                                                      | Vite on port 3002                                 |
| Commitlint sample | `echo 'feat(portal): add dual-shell dashboard chrome' \| bunx commitlint` | exit 0                                            |

## Suggested executor toolkit

- If available: repo skill `.agents/skills/shadcn/SKILL.md` — run shadcn add/search from `packages/ui` with Bun.
- Read fully before coding: `apps/portal/CONTEXT.md`.
- Optional visual reference: [shadcn sidebar](https://ui.shadcn.com/docs/components/sidebar) / dashboard blocks — adapt to Portal tokens; do not copy purple demo themes.

## Scope

**In scope** (the only paths you should modify/create):

- `apps/portal/docs/adr/0001-dual-shell-hard-switch.md` (create; portal-scoped ADR)
- `apps/portal/src/lib/portal-fixtures.ts` (create)
- `apps/portal/src/lib/portal-role.ts` (create) — role helper reading `VITE_PORTAL_ROLE`
- `apps/portal/src/components/shell/**` — Operator shell, Client Workspace shell, Workspace Switcher, nav helpers
- `apps/portal/src/routes/**` — restructure authenticated routes for `/op/*` and `/w/$clientId/*`; keep auth API routes; update `index.tsx` gate/redirect
- `apps/portal/src/vite-env.d.ts` — add `VITE_PORTAL_ROLE` typing if needed
- `apps/portal/.env.example` — document `VITE_PORTAL_ROLE`
- `apps/portal/CONTEXT.md` — **only** if a term is missing for something this plan introduces (e.g. route path nicknames are not glossary terms — prefer not to edit). Do not rewrite settled definitions.
- `packages/ui/src/components/*` — only components added via shadcn for this plan (sidebar and its CLI dependencies; plus `card`, `switch`, `breadcrumb`, `sheet`, `tooltip` if not pulled in transitively)
- `plans/README.md` — status row for 002

**Out of scope** (do NOT touch):

- Real Convex schema/tables for clients, invoices, files, CMS, analytics
- Payment provider integration, file upload to R2/S3, real analytics ingestion
- WorkOS organization roles / multi-seat invites
- Brand or Portfolio apps
- Changing Portal color tokens to a new theme
- Implementing real Message delivery (UI stub/composer that writes to fixture or local state only is OK; no email/backend)
- Plan 001 / portfolio work

## Git workflow

- Branch: `advisor/002-portal-dual-shell-dashboard`
- Commits: Conventional Commits with scope `portal` or `ui` (or omit scope if a single commit truly spans both equally — prefer splitting: `feat(ui): add sidebar primitives`, then `feat(portal): add dual-shell dashboard chrome`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Drift check

Run:

```bash
git diff --stat 33ed6d2..HEAD -- apps/portal packages/ui docs/adr
```

**Verify**: If `apps/portal/src/routes/index.tsx` or `packages/ui/components.json` differ materially from this plan’s excerpts, STOP and report. If only unrelated portal env files differ, continue.

### Step 1: Record the dual-shell ADR

Create `apps/portal/docs/adr/0001-dual-shell-hard-switch.md`:

```md
# Dual-shell hard switch (Operator Home ↔ Client Workspace)

Portal serves Operators and Clients in two distinct chrome shells. Operators
leave Operator Home to enter a Client Workspace (same Area UI Clients see)
and return via an Operator-only Workspace Switcher — not an overlay or shared
admin chrome. Client Workspace binds to one Client; Insights/Website are
per-Client Features. See apps/portal/CONTEXT.md.
```

**Verify**: `test -f apps/portal/docs/adr/0001-dual-shell-hard-switch.md` → file exists.

### Step 2: Add shadcn dashboard primitives to `@hezaerd/ui`

From repo:

```bash
cd packages/ui
bunx --bun shadcn@latest add sidebar card switch breadcrumb sheet tooltip -y
```

If the CLI reports a component already exists, keep the existing file (do not `--overwrite` unless the add fails without it — then STOP and report).

Export paths are already `./components/*` — no need to change `package.json` exports unless a new subpath is required.

**Verify**:

```bash
bun run --filter @hezaerd/ui typecheck
ls packages/ui/src/components/sidebar.tsx packages/ui/src/components/card.tsx
```

→ typecheck exit 0; both files exist (sidebar may be split across multiple files — confirm at least one sidebar entry file exists under `components/`).

### Step 3: Fixture + role modules

Create:

1. `apps/portal/src/lib/portal-fixtures.ts`
   - At least **2** mock Clients (`id`, `name`, `features: { insights: boolean; website: boolean }`).
   - Per-Client: `needsAttention[]` with `{ id, title, hrefFragment }` covering examples: unpaid invoice, file request, feature unlock (only if that Feature is on).
   - Practice cockpit numbers: `openInvoiceTotal`, `paidThisMonth`, `clientsWaiting`, `activeClients`.
   - Helper `getClient(id)`, `listClients()`.

2. `apps/portal/src/lib/portal-role.ts`
   - `export type PortalRole = "operator" | "client"`
   - `export function getPortalRole(): PortalRole` using `VITE_PORTAL_ROLE` as specified above.

3. Update `apps/portal/.env.example` with:

```bash
# UI role for local dual-shell testing: operator | client (default: operator)
# VITE_PORTAL_ROLE=operator
```

**Verify**: `bun run --filter @hezaerd/portal typecheck` → exit 0.

### Step 4: Shell layout components

Create under `apps/portal/src/components/shell/`:

| File                         | Responsibility                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `operator-shell.tsx`         | SidebarProvider + sidebar nav (Home, Clients, Invoices, Settings) + top bar (account email, Sign out) + denser main padding OK                                                              |
| `client-workspace-shell.tsx` | Sidebar with Areas filtered by Features; sparse main; top bar shows Client name; if Operator, render Workspace Switcher; footer/persistent **Message Hezaerd** entry (dialog or route stub) |
| `workspace-switcher.tsx`     | Dropdown: current Client, other Clients → navigate `/w/$id`, item “Back to Operator Home” → `/op`                                                                                           |
| `needs-attention-list.tsx`   | Renders list or Empty “You’re all caught up.” Use `@hezaerd/ui/components/empty`                                                                                                            |
| `practice-cockpit.tsx`       | Exactly four tiles (labels matching CONTEXT): open invoice total, paid this month, Clients waiting on them, active Clients count                                                            |

Nav link labels (exact):

- Operator: `Home`, `Clients`, `Invoices`, `Settings`
- Client: `Home`, `Invoices`, `Files`, and conditionally `Insights`, `Website`

Use TanStack Router `Link` with `activeProps` / pathname matching. Prefer `@hezaerd/ui` Button/Dropdown where it fits; Sidebar primitives from the new sidebar component.

**Verify**: typecheck portal exits 0.

### Step 5: Route restructure

Implement file routes (TanStack file routing — after adding files, run dev or build once so `routeTree.gen.ts` regenerates; do not hand-edit `routeTree.gen.ts`).

**Target map:**

| Path                    | Role     | UI                                                                                                                                                       |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | both     | loading / login (unauth); if auth Operator → redirect `/op`; if auth Client → redirect `/w/<firstFixtureClientId>`                                       |
| `/op`                   | Operator | Operator Home: Practice Cockpit + Client list (each row links to Client record or Open workspace)                                                        |
| `/op/clients`           | Operator | Client directory (table/list denser)                                                                                                                     |
| `/op/clients/$clientId` | Operator | **Client record**: name, Switch toggles Insights/Website (fixture state — React state or module-level mutable fixture OK for v1), CTA **Open workspace** |
| `/op/invoices`          | Operator | Placeholder practice-wide invoices (dense empty or fixture table) — not Client pay-first UI                                                              |
| `/op/settings`          | Operator | Minimal placeholder (“Practice settings — coming soon”)                                                                                                  |
| `/w/$clientId`          | both     | layout = Client Workspace shell                                                                                                                          |
| `/w/$clientId/`         | both     | Client Home = Needs Attention from fixtures                                                                                                              |
| `/w/$clientId/invoices` | both     | Pay-first layout: unpaid section with Pay buttons (disabled or `alert` stub), paid collapsed                                                             |
| `/w/$clientId/files`    | both     | File requests section + open upload dropzone UI stub (no real upload)                                                                                    |
| `/w/$clientId/insights` | both     | Only if Feature on; else redirect Home. Three truths + Takeaway placeholders                                                                             |
| `/w/$clientId/website`  | both     | Only if Feature on; else redirect Home. Guided Editable fields list + Preview/Publish buttons (stub)                                                     |
| `/w/$clientId/message`  | both     | Lightweight message form stub                                                                                                                            |

Protect `/op/*`: if `getPortalRole() === "client"`, redirect to workspace Home.

Keep existing `/api/auth/*` and `/signout` routes working.

Refactor `index.tsx`: remove inline `Dashboard`; login screen copy should say invite-only Client/Operator portal — not “products, customers, and sales.”

**Verify**:

```bash
bun run --filter @hezaerd/portal typecheck
bun run lint
```

→ both exit 0.

Manual smoke (with `bun run dev:portal`):

1. Sign-in path still reaches authenticated UI (or login form if logged out).
2. Operator: `/op` shows 4 cockpit tiles + clients.
3. Open Client record → toggle Website → Open workspace → sidebar shows Website; switcher visible.
4. Workspace Switcher → Back to Operator Home.
5. `VITE_PORTAL_ROLE=client` → no switcher, `/op` redirects away.

### Step 6: Density + empty states pass

- Client Workspace pages: generous spacing, short copy, no metric card grids on Home.
- Operator `/op/clients` and `/op/invoices`: tighter tables/lists OK.
- Every empty Area uses `Empty` from `@hezaerd/ui` with one sentence matching the Area’s job.

**Verify**: `bun run check` from repo root (lint + format + typecheck) → exit 0. If format fails, run `bun run format:fix` then re-check — only on files you touched.

### Step 7: Commit and mark plan status

Commit in logical units, e.g.:

```text
docs(portal): record dual-shell hard-switch ADR
feat(ui): add sidebar and dashboard primitives
feat(portal): add dual-shell dashboard chrome with fixtures
```

(Adjust if `docs` scope is rejected by commitlint — portal ADR under `apps/portal` may use `docs(portal):` or `feat(portal):` depending on whether commitlint allows `docs` with scope `portal`; both type and scope enums allow `docs` + `portal`.)

Update `plans/README.md` row 002 → `DONE`.

**Verify**: `git log -3 --oneline` shows your commits; `plans/README.md` status is DONE.

## Test plan

This repo’s portal package has **no test runner yet**. Do not invent a Jest/Vitest stack in this plan.

- Manual smoke checklist in Step 5 is the acceptance test.
- Optional follow-up (out of scope): add Vitest + Testing Library for `getPortalRole` and Feature-filtered nav — only if you already find a test harness in-repo for portal (you will not).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun run --filter @hezaerd/ui typecheck` exits 0
- [ ] `bun run --filter @hezaerd/portal typecheck` exits 0
- [ ] `bun run lint` exits 0
- [ ] `bun run format` exits 0
- [ ] `apps/portal/docs/adr/0001-dual-shell-hard-switch.md` exists
- [ ] `rg -n "Business overview" apps/portal` returns no matches
- [ ] Operator routes exist under `apps/portal/src/routes/op` (or equivalent file-route naming that produces `/op` paths)
- [ ] Client Workspace routes exist for `/w/$clientId` Areas listed in Step 5
- [ ] Workspace Switcher code path is gated so Client role does not render it (`rg -n "WorkspaceSwitcher|workspace-switcher" apps/portal/src` finds the component; role gate visible in shell)
- [ ] No Convex schema changes (`git diff --stat` shows no `packages/backend/convex/schema.ts` changes)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row for 002 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- Drift check shows `index.tsx` auth flow rewritten differently (e.g. middleware-only gate) so redirects must attach elsewhere — report the new entrypoint.
- `shadcn add sidebar` fails or pulls React 18 / incompatible peer deps that break the catalog React 19 workspace — do not force downgrades; report the error.
- TanStack Start file routing cannot express nested `/w/$clientId/*` layouts without a pattern not used elsewhere in the monorepo — try pathless layout routes once; if still blocked, STOP with the error.
- You believe real Convex Client records are required to finish the shell (they are not — use fixtures).
- Any step’s verification fails twice after a reasonable fix attempt.
- A change appears to require editing Brand/Portfolio or backend schema.

## Maintenance notes

- **Next plans** (not this one): Convex `clients` + Feature flags; Invoices + Pay; Files + File requests storage; Website Editable fields model; Insights data pipeline; Message persistence; WorkOS role claims replacing `VITE_PORTAL_ROLE`.
- **Reviewer focus**: hard-switch honesty (Operator chrome must not leak into Client-visible sidebar); Feature-filtered nav; glossary labels (`Insights` / `Website`); fixture code clearly marked so it is deleted when APIs land.
- **Fixture deletion cue**: when a real `api.clients.*` query exists, remove `portal-fixtures.ts` and replace imports in one PR.
- Density: resist “improving” Client Home with status cards — that contradicts CONTEXT.md.
