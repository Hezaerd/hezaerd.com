# Plan 001: Rebuild portfolio archive and realign Brand Work

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 2bb2298..HEAD -- apps/portfolio apps/brand packages/content CONTEXT-MAP.md apps/brand/CONTEXT.md apps/portfolio/CONTEXT.md README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `2bb2298`, 2026-07-21

## Why this matters

The monorepo already splits `hezaerd.com` (Brand) and `portfolio.hezaerd.com` (Portfolio), but Portfolio is an empty section shell and Brand still shows invented “case studies” that deep-link into Portfolio. Domain docs now define a clear split: Brand sells the company with real client **Work**; Portfolio is the person/maker home with **Projects**, About, and Resume. This plan restores the craft archive from git commit `6aaefc5`, puts yleoture on Brand only, removes the shared content package, and stops Brand from pretending Portfolio hosts company case studies.

## Current state

### Domain vocabulary (must honor — do not invent synonyms)

From `CONTEXT-MAP.md`:

- Brand ↔ Portfolio Work/Project collections are **disjoint** (a piece lives in one place only).
- Content is **app-local** — no shared work/projects content package.

From `apps/brand/CONTEXT.md`:

- **Work** = company/client outcomes on Brand.
- **Capability** = presented as **Services** (existing `/services` route) — not a second nav item.
- **Case Study** pages on Brand are **not required yet** — listings first.

From `apps/portfolio/CONTEXT.md`:

- **Portfolio** = person site with Projects, About, Resume (GitHub/Music later).
- **Project** = personal craft; may include meta “built my own Brand site” narrative for Hezaerd.com.
- **Project detail** = addressable route (not modal-only).

### Classification of legacy pieces (from `6aaefc5` `src/data/projects.ts`)

| Title           | Home                  | Notes                                                                                                             |
| --------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| yleoture.com    | Brand **Work**        | Client project                                                                                                    |
| Stellar Suplex  | Portfolio **Project** | End-of-studies                                                                                                    |
| Los Pingheros   | Portfolio **Project** |                                                                                                                   |
| Coloris         | Portfolio **Project** |                                                                                                                   |
| Kokopelli       | Portfolio **Project** |                                                                                                                   |
| Better Axolotls | Portfolio **Project** |                                                                                                                   |
| Hezaerd.com     | Portfolio **Project** | Meta narrative: building the site that sells the company — update copy accordingly; do **not** list as Brand Work |

### Relevant files today

- `apps/portfolio/src/routes/index.tsx` — homepage with stub sections including github/music
- `apps/portfolio/src/lib/navigation.ts` — nav still includes github + music
- `apps/portfolio/src/components/hero-section.tsx` — working hero; resume button not wired
- `apps/portfolio/src/components/ui/dialog.tsx` — exists but Project detail must be a **route**, not modal-only
- `apps/brand/src/routes/index.tsx` — “Selected outcomes” from `@hezaerd/content`
- `apps/brand/src/routes/work.tsx` — lists fake studies; links to `portfolioUrl + portfolioPath`
- `packages/content/src/case-studies.ts` — invented Brand themes (`high-performance-tooling`, `game-systems`)
- Legacy source of truth for content/media: git commit `6aaefc5` paths `src/data/*` and `public/images|videos/*`

### Current excerpts

Portfolio stubs (`apps/portfolio/src/routes/index.tsx`):

```tsx
<Section id="about" ...><h2>About</h2></Section>
<Section id="projects" ...><h2>Projects</h2></Section>
<Section id="resume" ...><h2>Resume</h2></Section>
<Section id="github" ...><h2>GitHub</h2></Section>
<Section id="music" ...><h2>Music</h2></Section>
```

Brand Work deep-link lie (`apps/brand/src/routes/work.tsx`):

```tsx
<a href={`${site.portfolioUrl}${study.portfolioPath}`}>Full case study</a>
```

Fake studies (`packages/content/src/case-studies.ts`):

```ts
slug: "high-performance-tooling",
portfolioPath: "/#projects",
// ...
slug: "game-systems",
portfolioPath: "/#projects",
```

### Repo conventions

- Package manager: **Bun** (`packageManager: bun@1.2.19`). Prefer `bun` / `bun run`.
- Apps: TanStack Start + Vite + React 19 + Tailwind 4 under `apps/brand` and `apps/portfolio`.
- Path alias `@/` → app `src/` (match existing imports).
- Commits: Conventional Commits with **required scope** = directory under `apps/` or `packages/` (see `commitlint.config.mjs`). Examples from history: `feat: split site into brand and portfolio monorepo`, `feat(portfolio): …` once scoped — use scopes like `portfolio`, `brand`, `content` while that package still exists.
- Shared UI tokens live in `@hezaerd/ui`; Portfolio also has local `components/ui/*` — **match Portfolio’s existing local UI** for new Portfolio sections; do not redesign Brand’s visual system in this plan.
- No Portfolio/Brand component test suite today. Verification is typecheck + lint/format + build + grep gates. Optional tiny pure-data unit tests are nice-to-have, not required.

### Media at `6aaefc5` (restore into the owning app’s `public/`)

Portfolio (all except yleoture):

- `public/images/{stellar-suplex,los-pingheros,coloris,kokopelli,better-axolotl,hezaerd-com}.jpg`
- `public/videos/{stellar-suplex,coloris,kokopelli}.mp4`, `los-pingheros.webm`

Brand:

- `public/images/yleoture.jpg`

## Commands you will need

| Purpose             | Command                                                                               | Expected on success          |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| Install             | `bun install`                                                                         | exit 0                       |
| Typecheck           | `bun run typecheck`                                                                   | exit 0, all tasks successful |
| Lint                | `bun run lint`                                                                        | exit 0                       |
| Format check        | `bun run format`                                                                      | exit 0                       |
| Full check          | `bun run check`                                                                       | exit 0                       |
| Build portfolio     | `bun run build:portfolio`                                                             | exit 0                       |
| Build brand         | `bun run build:brand`                                                                 | exit 0                       |
| Extract legacy file | `git show 6aaefc5:src/data/projects.ts`                                               | prints file                  |
| Extract legacy blob | `git show 6aaefc5:public/images/yleoture.jpg > apps/brand/public/images/yleoture.jpg` | file created                 |

## Suggested executor toolkit

- If available, read `apps/brand/CONTEXT.md` and `apps/portfolio/CONTEXT.md` before naming types/routes.
- Use TanStack Router file-based routes consistent with existing `apps/*/src/routes/*.tsx` (`createFileRoute`).
- Do **not** restore Next.js APIs, Spotify OAuth, or GitHub stats from `6aaefc5`.

## Scope

**In scope** (the only paths you should modify / create):

- `apps/portfolio/src/**` (data, components, routes, navigation, hero wiring)
- `apps/portfolio/public/images/**`, `apps/portfolio/public/videos/**` (create as needed)
- `apps/brand/src/**` (local work data, home + work pages copy/links; about copy only if it still promises Portfolio hosts company case studies)
- `apps/brand/public/images/**` (yleoture image)
- `apps/brand/package.json` (remove `@hezaerd/content` dependency)
- `packages/content/**` (**delete entire package**)
- `README.md` (remove `@hezaerd/content` from packages table)
- `docs/adr/0001-brand-portfolio-boundaries.md` (create — short ADR recording the split)
- `bun.lock` (updated by `bun install` after package removal)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- GitHub stats UI/API, Spotify/Music section, `/spotify` helper
- Brand Case Study detail routes (`/work/$slug`) — listings only for now
- Visual redesign of Brand marketing pages beyond Work/home content fixes
- `packages/ui`, `packages/auth`, `packages/backend`, `packages/env` (unrelated)
- Changing production domains or Vercel project layout
- Editing `CONTEXT*.md` unless a factual contradiction with this plan appears — then STOP and report
- Implementing overlapping Work+Project listings

## Git workflow

- Branch: `advisor/001-rebuild-portfolio-align-brand-work` (or continue on the operator’s existing branch if they already created one for this work)
- Commit per logical unit with Conventional Commits + scope, e.g.:
  - `feat(portfolio): restore project archive and detail routes`
  - `feat(brand): replace invented case studies with client work`
  - `chore(content): remove shared content package`
  - `docs: record brand and portfolio content boundaries`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Drift check and baseline

Run the drift check from the executor instructions. Then:

```bash
bun run typecheck
```

**Verify**: exit 0 (baseline green). If red before you change anything, STOP.

### Step 1: Record the ADR

Create `docs/adr/0001-brand-portfolio-boundaries.md`:

```md
# Brand and Portfolio content boundaries

Brand (hezaerd.com) is the company site: Services (capabilities) and real client Work.
Portfolio (portfolio.hezaerd.com) is the person/maker site: Projects, About, and Resume.
Work and Projects are disjoint collections with app-local data — no shared content package
and no dual listing. Brand Work deep dives do not live on Portfolio; Case Study pages on
Brand can wait until there is enough client Work. Craft signals (GitHub, Music) on
Portfolio are deferred.
```

**Verify**: `test -f docs/adr/0001-brand-portfolio-boundaries.md` → exit 0

### Step 2: Portfolio local data + media

1. Create `apps/portfolio/src/data/` with modules ported from `6aaefc5`:
   - `projects.ts` — Portfolio Projects only (exclude yleoture). Add a stable `slug` field for each (`stellar-suplex`, `los-pingheros`, `coloris`, `kokopelli`, `better-axolotls`, `hezaerd-com`). Keep rich fields from the legacy `Project` interface (description, tags, media, longDescription, features, challenges, technologies, urls, duration, teamSize, role).
   - Update **Hezaerd.com** Project copy so the narrative is “building my own website / the site that sells the company” (maker craft), not a joke-only blurb and not Brand Work.
   - `personal-info.ts`, `skills.ts`, `experience.ts` — port from `6aaefc5` (icons: do **not** import `lucide-react` / `react-icons` into data files; keep data icon-free like experience/skills already are. Footer already has socials — do not require porting `socials.ts` unless needed).
   - Export helpers: `getProjects()`, `getProject(slug: string)`.
2. Restore media into `apps/portfolio/public/images` and `apps/portfolio/public/videos` from `6aaefc5` via `git show 6aaefc5:public/... > apps/portfolio/public/...` (create directories first). Skip `yleoture.jpg`.

**Verify**:

```bash
test -f apps/portfolio/src/data/projects.ts
test -f apps/portfolio/public/images/stellar-suplex.jpg
test -f apps/portfolio/public/videos/stellar-suplex.mp4
rg -n "yleoture" apps/portfolio/src/data/projects.ts; echo "yleoture_exit:$?"
```

Expected: first three commands exit 0; `rg` finds **no** yleoture (`yleoture_exit:1`).

### Step 3: Trim Portfolio navigation (defer GitHub / Music)

Update `apps/portfolio/src/lib/navigation.ts` to **only**:

`home`, `about`, `projects`, `resume`

Remove github/music entries and types accordingly. Update any navbar/active-section consumers that assume the old list.

**Verify**:

```bash
rg -n "github|music" apps/portfolio/src/lib/navigation.ts; echo "exit:$?"
bun run typecheck --filter=@hezaerd/portfolio
```

Expected: no matches in navigation.ts (`exit:1`); typecheck exit 0. (Turbo filter syntax: `bunx turbo run typecheck --filter=@hezaerd/portfolio` if needed.)

### Step 4: Projects section + addressable detail route

1. Implement a Projects section component used on `/#projects` that lists Portfolio Projects (cards/rows with image, title, summary, tags). Each item links to `/projects/$slug` via TanStack `Link`.
2. Add route file `apps/portfolio/src/routes/projects.$slug.tsx` (or the file-route naming this repo’s TanStack version expects — match existing `createFileRoute` style in `apps/portfolio/src/routes/`). Detail page renders the full Project fields; unknown slug → notFound / 404 pattern used by TanStack Start in this repo (if none exists, a simple “Project not found” message is acceptable).
3. Wire `apps/portfolio/src/routes/index.tsx` Projects stub to the new section component.
4. Do **not** make modal the only way to read a Project. A modal polish on top of the route is optional and out of scope unless trivial; the route is mandatory.

**Verify**:

```bash
test -f apps/portfolio/src/routes/projects.\$slug.tsx || test -f apps/portfolio/src/routes/projects.$slug.tsx
rg -n "getProject|projects/" apps/portfolio/src/routes apps/portfolio/src/components
bunx turbo run typecheck --filter=@hezaerd/portfolio
bun run build:portfolio
```

Expected: route file exists; references to project detail exist; typecheck and build exit 0.

### Step 5: About + Resume sections

1. Replace About stub with content from `personal-info` + `skills` (structure can follow legacy about section: bio, location, skills list — use Hugeicons already in the app if you need icons; avoid adding new icon libraries).
2. Replace Resume stub with work experience + education from `experience.ts`.
3. Remove github and music **sections** from `index.tsx`.
4. Wire hero “Grab my resume” to `scrollToSection("resume")` (legacy referenced `/resume.pdf` but that file is not in `6aaefc5` tree — do not invent a PDF). Optionally hide/disable download styling and label it as jump-to-resume if clearer.

**Verify**:

```bash
rg -n 'id="github"|id="music"' apps/portfolio/src/routes/index.tsx; echo "exit:$?"
bunx turbo run typecheck --filter=@hezaerd/portfolio
```

Expected: no github/music section ids (`exit:1`); typecheck 0.

### Step 6: Brand local Work data + media

1. Create `apps/brand/src/data/work.ts` with a `Work` type and at least **yleoture** (port fields from `6aaefc5` projects entry: title, summary/description, role, tags, technologies, releaseUrl, previewImage `/images/yleoture.jpg`, duration, etc.). Include `slug: "yleoture"`.
2. Export `getWork()` / `getWorkItem(slug)` as needed.
3. Restore `apps/brand/public/images/yleoture.jpg` from `6aaefc5`.
4. Do **not** put Portfolio Projects in this file.

**Verify**:

```bash
test -f apps/brand/src/data/work.ts
test -f apps/brand/public/images/yleoture.jpg
rg -n "yleoture" apps/brand/src/data/work.ts
rg -n "stellar-suplex|Stellar Suplex" apps/brand/src/data; echo "portfolio_leak:$?"
```

Expected: yleoture present; no Portfolio project titles in brand data (`portfolio_leak:1`).

### Step 7: Realign Brand home + Work pages

1. Update `apps/brand/src/routes/work.tsx`:
   - Use local `getWork()` / work list.
   - Copy must **not** say full case studies live on Portfolio.
   - Links: live site (`releaseUrl`) and/or on-Brand detail later — for now listing + external live link is enough. **No** `portfolioUrl` deep links for Work items.
   - Meta description: commercial Work on Brand, not Portfolio archive.
2. Update `apps/brand/src/routes/index.tsx` “Selected outcomes”:
   - Source from local Work (yleoture).
   - Replace “Case study” → Portfolio links with “View site” / “See work” pointing at `/work` or the live URL — never Portfolio `#projects` for company Work.
3. Keep `/services` as Capabilities (no new Capabilities nav).
4. Remove all imports of `@hezaerd/content` from Brand.

**Verify**:

```bash
rg -n "@hezaerd/content|getBrandCaseStudies|portfolioPath|Full case study" apps/brand/src; echo "exit:$?"
bunx turbo run typecheck --filter=@hezaerd/brand
bun run build:brand
```

Expected: no matches (`exit:1`); typecheck and build exit 0.

### Step 8: Delete `@hezaerd/content`

1. Remove dependency from `apps/brand/package.json`.
2. Delete `packages/content/` entirely.
3. Update root `README.md` packages table to drop `@hezaerd/content`.
4. Run `bun install` to refresh `bun.lock`.

**Verify**:

```bash
test ! -d packages/content
rg -n "@hezaerd/content" apps packages README.md bun.lock; echo "exit:$?"
bun run typecheck
bun run check
```

Expected: directory gone; no remaining references (`exit:1` for rg, or only unrelated hits — there should be zero); typecheck and check exit 0.

### Step 9: Final smoke

```bash
bun run build
rg -n "high-performance-tooling|game-systems" apps packages; echo "fake_studies:$?"
rg -n 'id="github"|id="music"' apps/portfolio/src; echo "deferred_sections:$?"
```

Expected: build exit 0; fake studies gone (`fake_studies:1`); deferred sections absent from portfolio src (`deferred_sections:1`).

Update `plans/README.md` status for 001 → DONE.

## Test plan

- No existing Portfolio/Brand UI test harness. Do not add a heavy test framework in this plan.
- Optional (nice-to-have): if you add a tiny pure function test next to data helpers, follow `packages/env/src/parse.test.ts` style — **not required** for Done.
- Manual checks (operator or executor with `bun run dev:portfolio` / `dev:brand`):
  - Portfolio `/` shows About, Projects, Resume only (no GitHub/Music sections).
  - `/projects/stellar-suplex` renders detail; `/projects/yleoture` does not exist.
  - Brand `/work` lists yleoture only; no link to portfolio case study.
  - Brand home selected outcomes do not deep-link company Work into Portfolio.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun run check` exits 0
- [ ] `bun run build` exits 0
- [ ] `packages/content` directory does not exist
- [ ] `rg -n "@hezaerd/content" apps packages README.md` returns no matches
- [ ] `rg -n "high-performance-tooling|game-systems" apps packages` returns no matches
- [ ] `rg -n "yleoture" apps/portfolio/src/data` returns no matches
- [ ] `rg -n "yleoture" apps/brand/src/data` returns matches
- [ ] Portfolio nav/sections have no github/music for this ship
- [ ] Portfolio has an addressable project detail route under `apps/portfolio/src/routes/`
- [ ] `docs/adr/0001-brand-portfolio-boundaries.md` exists
- [ ] No files outside the in-scope list are modified (`git status` review)
- [ ] `plans/README.md` status row for 001 is DONE

## STOP conditions

Stop and report back (do not improvise) if:

- Drift check shows in-scope files no longer match the Current state excerpts.
- `6aaefc5` is missing from the local git object store (cannot `git show` legacy files).
- TanStack file-route naming for `$slug` conflicts with generated `routeTree.gen.ts` in a way that is not fixed by the app’s normal codegen on `vite build` / `vite dev` — do not hand-edit generated trees except as this repo already does.
- You believe client Work other than yleoture must ship immediately and lack content — do not invent Work; ship yleoture only.
- A step’s verification fails twice after a reasonable fix attempt.
- The fix appears to require touching out-of-scope packages (`auth`, `backend`, `env`, redesigning Brand Services).
- You are tempted to put Stellar Suplex (or any school/personal Project) on Brand Work to “fill” the page — that violates disjoint ownership; STOP.

## Maintenance notes

- When a second client engagement exists, add it to `apps/brand/src/data/work.ts` only; consider Brand Case Study routes then (deferred).
- When re-adding GitHub/Music, extend `navigation.ts` and homepage sections deliberately — do not silently revive Spotify API routes from `6aaefc5` without a new plan.
- Reviewers should scrutinize: (1) no Brand→Portfolio Work deep links, (2) yleoture not in Portfolio data, (3) Hezaerd.com Project narrative is maker/meta not client Work, (4) `@hezaerd/content` fully gone from lockfile and README.
- Follow-ups explicitly deferred: GitHub stats, Spotify/Music, Brand `/work/$slug` Case Studies, resume PDF asset, carousel/search polish from the old Embla UI (nice-to-have; a clear list + detail route is enough for Done).
