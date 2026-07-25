# Plan 001: Align Portal chrome to Client Desk (Operators never enter Client Workspace)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d1f8048..HEAD -- apps/portal/src apps/portal/docs/adr/0003-operator-desk-client-only-workspace.md apps/portal/CONTEXT.md packages/backend/convex`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none (glossary + ADR-0003 already landed in the working tree / prior docs work; verify they match "Documented product decision" below)
- **Category**: direction
- **Planned at**: commit `d1f8048`, 2026-07-25

## Why this matters

Product decision (ADR-0003): Operators pilot engagements from **Client Desk** under `/op/clients/{slug}`; **Client Workspace** (`/w/…`) is Client-only. The UI still implements the old hard-switch model (Open workspace, Workspace Switcher, Operator chrome inside Client Workspace, in-app Message). Until chrome matches the glossary, every later feature (Invoices, Files, Website) will land in the wrong place and train the wrong habit. This plan is **chrome + routing + honest empty Desk stubs only** — not the Invoice/Files/Website data plane.

## Current state

### Documented product decision (must honor)

From `apps/portal/docs/adr/0003-operator-desk-client-only-workspace.md`:

> Portal stays one app with two role-bound shells, but Operators never use
> Client Workspace chrome. They pilot each engagement from **Client Desk**
> (`/op/clients/{slug}` + Desk sections): dual queues (Waiting on Client /
> Waiting on Operator) and practice-side Invoices, Files, Website, Insights,
> and Features. Clients alone Pay, Publish, and fulfill File requests.
> Operator hits on `/w/…` redirect to the matching Desk. In-app Message is
> out of scope — communication stays outside Portal. … Client-to-Client jump
> UX (e.g. cmd+K) is deferred.

Glossary terms to use in UI labels/comments (French UI copy stays French; English code identifiers use these terms): **Client Desk**, **Desk section**, **Waiting on Client**, **Waiting on Operator**, **Needs Attention** (Client Home only). Do **not** reintroduce Workspace Switcher, Open workspace, Message, or Client record.

### Relevant files today

- `apps/portal/src/routes/op/clients/$clientId.tsx` — thin “Client record”: Features + **Ouvrir l’espace** → `/w/$clientId`
- `apps/portal/src/routes/op/index.tsx` — Operator Home; Client rows have **Fiche** + **Espace** (`/w/…`)
- `apps/portal/src/components/shell/client-workspace-shell.tsx` — Operator header (back to Opérateur + WorkspaceSwitcher) + Message footer
- `apps/portal/src/components/shell/workspace-switcher.tsx` — Operator-only Client jump via `/w/…`
- `apps/portal/src/routes/w/$clientId/route.tsx` — wraps all `/w/*` in ClientWorkspaceShell; **no Operator redirect**
- `apps/portal/src/routes/w/$clientId/message.tsx` — in-app Message UI (must be removed)
- `apps/portal/src/lib/portal-role.ts` — `usePortalViewer()` exposes `isOperator` / `clientSlug`
- `apps/portal/src/routeTree.gen.ts` — generated; must regenerate after route file moves
- `apps/portal/src/routes/w/$clientId/{invoices,files,insights,website,index}.tsx` — Client Area pages (keep for Clients; Message deleted)
- `apps/portal/src/routes/op/invoices.tsx` — keep global Operator Invoices (practice ledger); do not remove

### Excerpts (confirm before editing)

Operator CTA into Client Workspace (`apps/portal/src/routes/op/clients/$clientId.tsx`):

```98:112:apps/portal/src/routes/op/clients/$clientId.tsx
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">Espace</h2>
        ...
          <Button render={<Link to="/w/$clientId" params={{ clientId: client.id }} />}>
            Ouvrir l&apos;espace
```

Operator chrome inside Client Workspace (`apps/portal/src/components/shell/client-workspace-shell.tsx`):

```90:105:apps/portal/src/components/shell/client-workspace-shell.tsx
      headerStart={
        isOperator ? (
          <div className="flex min-w-0 items-center gap-2">
            <Link to="/op" ...>Opérateur</Link>
            ...
            <WorkspaceSwitcher currentClient={client} />
          </div>
        ) : null
      }
```

`/w` layout has no Operator gate (`apps/portal/src/routes/w/$clientId/route.tsx`):

```14:50:apps/portal/src/routes/w/$clientId/route.tsx
function ClientWorkspaceLayout() {
  const { clientId } = Route.useParams();
  const { user, loading: authLoading } = usePortalAuth();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });
  ...
  return (
    <ClientWorkspaceShell client={client} email={user.email}>
      <Outlet />
    </ClientWorkspaceShell>
  );
}
```

### Conventions

- Package manager: **Bun**. App: `@hezaerd/portal` (TanStack Start + Vite, port 3002).
- UI language: **French** (match existing portal copy).
- Components: `@hezaerd/ui` (`Button`, `Sidebar*`, etc.) + Hugeicons — match density/patterns in `operator-shell.tsx` and current client pages.
- Auth/role: `usePortalViewer()` / `usePortalAuth()` — same pattern as `apps/portal/src/routes/op/route.tsx`.
- File routes: TanStack Router file-based routes under `apps/portal/src/routes/`. After add/remove/rename route files, regenerate `routeTree.gen.ts` via a portal Vite build (see Steps).
- Commits: Conventional Commits with scope `portal` (see `commitlint.config.mjs`). Example from history: `feat(portal): replace fixtures with convex clients`.
- No automated UI test suite in this repo today — verification is typecheck/lint/grep + manual checklist.

## Commands you will need

| Purpose | Command | Expected on success |
| ------- | ------- | ------------------- |
| Install | `bun install` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Format check | `bun run format` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0 |
| Portal typecheck | `bun run --filter @hezaerd/portal typecheck` | exit 0 |
| Regenerate routes | `bun run --filter @hezaerd/portal build` | exit 0; updates `apps/portal/src/routeTree.gen.ts` |
| Full check | `bun run check` | exit 0 |

## Suggested executor toolkit

- Match existing portal French UI patterns; do not introduce a new design system.
- If a Convex/auth skill is available, use it only if you must touch `packages/backend` — this plan should not need backend changes.

## Scope

**In scope** (the only files you should modify, plus new files listed in Steps):

- `apps/portal/src/routes/op/index.tsx`
- `apps/portal/src/routes/op/clients/index.tsx`
- `apps/portal/src/routes/op/clients/$clientId.tsx` → **replace with directory** `apps/portal/src/routes/op/clients/$clientId/` (see Steps)
- `apps/portal/src/components/shell/client-workspace-shell.tsx`
- `apps/portal/src/components/shell/workspace-switcher.tsx` (delete)
- `apps/portal/src/routes/w/$clientId/route.tsx`
- `apps/portal/src/routes/w/$clientId/message.tsx` (delete)
- New: `apps/portal/src/components/shell/client-desk-nav.tsx` (or equivalent Desk sub-nav helper)
- New Desk section route stubs under `apps/portal/src/routes/op/clients/$clientId/`
- `apps/portal/src/routeTree.gen.ts` (regenerated)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- Building real Invoice / File / Website / Needs Attention / queue **data** in Convex
- cmd+K / keyboard Client jump (explicitly deferred in ADR-0003)
- Separate Operator/Client apps or custom preview hostnames
- Changing WorkOS / `OPERATOR_EMAILS` / seat-bind rules
- `apps/portal/CONTEXT.md` and ADR files (already updated) — unless a copy typo blocks you; do not rewrite product decisions
- Brand / Portfolio apps
- Reintroducing Message under another name
- Operator “Pay / Publish / fulfill as Client” surrogates
- Global `/op/invoices` removal (keep it)

## Git workflow

- Branch: `advisor/001-portal-client-desk-chrome`
- Commit per logical step (or small groups); messages like:
  - `feat(portal): redirect operators from client workspace to desk`
  - `feat(portal): replace client record with client desk shell`
  - `refactor(portal): remove workspace switcher and message area`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Drift check + docs sanity

1. Run the drift check from the executor banner.
2. Confirm ADR-0003 and CONTEXT still describe Client Desk / Client-only Workspace (grep):

```bash
rg -n "Client Desk|never use Client Workspace|Message is" apps/portal/docs/adr/0003-operator-desk-client-only-workspace.md apps/portal/CONTEXT.md
```

**Verify**: drift clean or excerpts still match; CONTEXT/ADR still contain Client Desk language. If ADR/CONTEXT were reverted to hard-switch, STOP.

### Step 1: Remove Message from Client Workspace

1. Delete `apps/portal/src/routes/w/$clientId/message.tsx`.
2. In `client-workspace-shell.tsx`, remove the footer “Contacter Hezaerd” / Message nav entirely (`footer={...}` → omit footer or pass empty/`null` per `DashboardChrome` API — match how OperatorShell omits Message).
3. Remove unused Message icon imports.

**Verify**:

```bash
rg -n "message|Contacter Hezaerd|MessageIcon|Message01Icon" apps/portal/src --glob '!routeTree.gen.ts'
```

→ no Client Message route/nav hits (allow unrelated words only if clearly not the Message feature).

### Step 2: Strip Operator chrome from Client Workspace

1. In `client-workspace-shell.tsx`, remove `usePortalViewer`, `WorkspaceSwitcher`, Operator `headerStart` block, and `ArrowLeft01Icon` if unused.
2. Delete `apps/portal/src/components/shell/workspace-switcher.tsx`.
3. Ensure Client Workspace shell is Client-only chrome (brand = client name, Areas nav only).

**Verify**:

```bash
rg -n "WorkspaceSwitcher|workspace-switcher|isOperator" apps/portal/src/components/shell
```

→ no matches in shell components (except possibly comments you should not leave).

### Step 3: Redirect Operators away from `/w/…`

In `apps/portal/src/routes/w/$clientId/route.tsx`:

1. Call `usePortalViewer()`.
2. While `viewer.loading` (and auth loading), keep the existing loading UI.
3. If `viewer.isOperator`, `Navigate` `replace` to the matching Desk path:
   - Map pathname segment after `/w/{slug}`:
     - `` / `` or empty → `/op/clients/$clientId`
     - `invoices` → `/op/clients/$clientId/invoices`
     - `files` → `/op/clients/$clientId/files`
     - `insights` → `/op/clients/$clientId/insights`
     - `website` → `/op/clients/$clientId/website`
     - `message` or anything else → `/op/clients/$clientId`
   - Implement with `useRouterState` pathname + `Navigate` `to` / `params` (TanStack Router). Prefer typed `to` strings once Desk routes exist (Step 4). If Step 3 lands before Step 4, temporary redirect all Operator `/w/*` hits to `/op/clients/$clientId` only, then tighten the map in Step 4 — **do not leave Operators rendering ClientWorkspaceShell**.
4. Optionally: if `viewer.isClient` and `viewer.clientSlug !== clientId`, deny/notFound — only if that guard already exists elsewhere; **do not invent new multi-tenant policy**. Existing client access stays as-is unless already enforced.

**Verify** (after Step 4 routes exist):

```bash
rg -n "isOperator" apps/portal/src/routes/w/\$clientId/route.tsx
```

→ present, with `Navigate` toward `/op/clients/`.

### Step 4: Convert Client record → Client Desk route tree

Replace leaf `apps/portal/src/routes/op/clients/$clientId.tsx` with a directory (same pattern as `w/$clientId/`):

```
apps/portal/src/routes/op/clients/$clientId/
  route.tsx          # load client by slug; Desk chrome (header + Desk section nav); <Outlet />
  index.tsx          # Desk landing: identity, dual queues (honest empty), Features toggles
  invoices.tsx       # Desk section stub (practice-side copy)
  files.tsx          # Desk section stub
  website.tsx        # Desk section stub (hide or note if Feature disabled — Operator may still configure later; for v1 stub show page always, Features still toggled on landing)
  insights.tsx       # Desk section stub
```

Requirements:

1. **`route.tsx`**: Reuse `api.clients.getBySlug` + `notFound` pattern from the old `$clientId.tsx`. Stay inside Operator shell (parent `/op/route.tsx` already wraps OperatorShell). Add a compact **Desk section sub-nav** (links to index + invoices/files/website/insights). Extract to `apps/portal/src/components/shell/client-desk-nav.tsx` if it keeps `route.tsx` readable.
2. **`index.tsx` (Desk landing)**:
   - Client identity header (name, contact email, initials) — keep visual language from old record page.
   - **Waiting on Client** and **Waiting on Operator** sections: honest empty states in French (e.g. « Rien en attente. ») — **no fake queue items**, no Needs Attention wording.
   - **Features** toggles (move existing Switch UI + `api.clients.setFeature` here).
   - **Remove** “Ouvrir l’espace” / any `/w/` link.
3. **Desk section stubs**: Operator practice-side framing only. French copy. No Pay / Publish / “fulfill as Client” CTAs. Prefer short “À venir” / empty practice panels over copying Client Area markup wholesale. Do **not** invent invoice amounts.
4. Regenerate routes:

```bash
bun run --filter @hezaerd/portal build
```

Then commit updated `routeTree.gen.ts`.

**Verify**:

```bash
test -f apps/portal/src/routes/op/clients/\$clientId/route.tsx
test -f apps/portal/src/routes/op/clients/\$clientId/index.tsx
test ! -f apps/portal/src/routes/op/clients/\$clientId.tsx
rg -n "Ouvrir l.espace|/w/\$clientId" apps/portal/src/routes/op/clients
bun run --filter @hezaerd/portal typecheck
```

→ files exist; no Open-workspace links under `op/clients`; typecheck exit 0.

Tighten Step 3 redirect map to Desk sections once these routes exist.

### Step 5: Operator Home + Clients directory CTAs

1. `apps/portal/src/routes/op/index.tsx`:
   - Remove **Espace** button linking to `/w/…`.
   - Primary CTA opens Client Desk: `/op/clients/$clientId` (rename button from « Fiche » to something like « Bureau » or « Ouvrir » — French; avoid “espace client” meaning Client Workspace).
   - Update subtitle copy: Client list opens Client Desk, not Client Workspace.
2. `apps/portal/src/routes/op/clients/index.tsx`:
   - Update page blurb (no “accès aux espaces” as hard-switch).
   - Button « Voir la fiche » → Desk language (e.g. « Ouvrir le bureau ») still linking to `/op/clients/$clientId`.

**Verify**:

```bash
rg -n 'to="/w/\$clientId"|to=\{"/w/\$clientId"' apps/portal/src/routes/op
```

→ no matches.

### Step 6: Final sweep + quality gates

1. Repo sweep for dead Operator→Workspace paths and Message:

```bash
rg -n "WorkspaceSwitcher|workspace-switcher|Ouvrir l.espace|Contacter Hezaerd|/w/\$clientId/message" apps/portal/src
```

→ no matches (except possibly `routeTree.gen.ts` until regenerated clean — regenerate if needed).

2. Confirm Clients can still navigate Areas (shell still links `/w/$clientId/...` for non-message Areas).

3. Run:

```bash
bun run check
```

**Verify**: exit 0.

### Step 7: Update plans index

Set this plan’s status to DONE in `plans/README.md`.

## Test plan

No Vitest/Playwright suite exists for portal. Do **not** add a test framework in this plan.

Manual checklist (executor or human after `bun run dev:portal`):

1. Sign in as Operator → `/op` → open a Client → lands on Desk (queues empty, Features work).
2. Desk sub-nav reaches invoices/files/website/insights stubs.
3. Visit `/w/{slug}` as Operator → redirects to `/op/clients/{slug}` (and section map if deep link).
4. Sign in as Client → `/w/{slug}` Client Workspace loads; no Message nav; no Operator switcher.
5. Global `/op/invoices` still reachable from Operator sidebar.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun run check` exits 0
- [ ] `test ! -f apps/portal/src/routes/w/\$clientId/message.tsx`
- [ ] `test ! -f apps/portal/src/components/shell/workspace-switcher.tsx`
- [ ] `test ! -f apps/portal/src/routes/op/clients/\$clientId.tsx`
- [ ] `test -f apps/portal/src/routes/op/clients/\$clientId/route.tsx`
- [ ] `test -f apps/portal/src/routes/op/clients/\$clientId/index.tsx`
- [ ] `rg -n "WorkspaceSwitcher|Ouvrir l.espace|Contacter Hezaerd" apps/portal/src` returns no matches
- [ ] `rg -n 'to="/w/\$clientId"' apps/portal/src/routes/op` returns no matches
- [ ] `rg -n "isOperator" apps/portal/src/routes/w/\$clientId/route.tsx` shows Operator → Desk redirect
- [ ] No files outside the in-scope list are modified (`git status` / `git diff --name-only`)
- [ ] `plans/README.md` status row for 001 is DONE

## STOP conditions

Stop and report back (do not improvise) if:

- Drift check shows in-scope excerpts no longer match and you cannot reconcile in &lt;15 minutes.
- CONTEXT/ADR-0003 were reverted to hard-switch / Operator-in-workspace.
- TanStack route directory migration cannot regenerate `routeTree.gen.ts` after two `bun run --filter @hezaerd/portal build` attempts.
- You believe Desk requires Convex schema changes to show non-empty queues (it does not for this plan — empty states are correct).
- Fix appears to require editing Brand/Portfolio, WorkOS config, or removing global `/op/invoices`.
- You are tempted to implement cmd+K or Message “just quickly.”

## Maintenance notes

- Next data-plane plans (Invoices, Files, Website, Needs Attention persistence) should feed **Waiting on Client / Waiting on Operator** on Desk and **Needs Attention** on Client Home — keep those vocabularies separate.
- Reviewer focus: Operators must never render `ClientWorkspaceShell`; Client Message fully gone; Desk stubs must not ship fake money/stats; French copy consistent.
- Deferred: cmd+K Client jump; real queue backends; Operator practice actions beyond Feature toggles.
