# Plan 003: Portal — CMS draft editing, preview JWT, publish UI

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5b4f224..HEAD -- apps/portal/src/routes apps/portal/src/lib/convex-queries.ts apps/portal/src/routes/op/clients apps/portal/src/routes/w packages/backend/convex/cms.ts`
> Compare excerpts on mismatch.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/001-cms-convex-backend.md, plans/002-cms-sdk-and-template.md
- **Category**: direction
- **Planned at**: commit `5b4f224`, 2026-07-28

## Why this matters

Portal already has CMS **chrome** (routes, nav labels, feature flag) but **no editing UI** and no preview/publish flows. Clients need the **Mon site** Area to edit guided fields; Operators need the **CMS** Desk section to manage labels, defaults, and deploy tokens. Preview JWT bridges Portal and the client's `/preview` route without exposing drafts on prod.

## Current state

**Client workspace route** — stub only:

```25:35:apps/portal/src/routes/w/$clientId/cms.tsx
function CmsContent() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Mon site</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Champs guidés — prévisualisez vos changements avant de publier.
        </p>
      </div>
    </div>
  );
}
```

**Operator desk route** — empty state:

```9:18:apps/portal/src/routes/op/clients/$clientId/cms.tsx
function ClientDeskCmsPage() {
  return (
    <Empty className="border-border bg-muted/20 rounded-xl border py-16">
      <EmptyHeader>
        <EmptyTitle className="font-display text-base font-semibold tracking-tight">
          À venir.
        </EmptyTitle>
```

**Data layer pattern** — TanStack Query + Convex (`apps/portal/src/lib/convex-queries.ts`):

```37:46:apps/portal/src/lib/convex-queries.ts
export function fileRequestsDeskQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.files.listForDesk, { slug }),
  });
}
```

**Needs Attention** — CMS kind exists in UI but **no backend query** feeds it yet (plan 004):

```48:55:apps/portal/src/components/shell/needs-attention-list.tsx
  cms: {
    icon: Globe02Icon,
    label: "Mon site",
    ctaLabel: "Relire les changements",
```

**Files upload pattern** — presigned R2 upload via Convex actions (`packages/backend/convex/fileStorage.ts` `prepareUpload` / `completeUpload`). CMS image upload should mirror this with `cms/{slug}/assets/{fieldKey}/{hash}.webp` keys.

**Vocabulary**:

- Client-facing: **Mon site** (never "CMS")
- Operator Desk: **CMS**
- Use `@hezaerd/ui` components (shadcn-style) — match Files/Invoices density: Client Workspace = calm; Desk = denser tables OK

## Commands you will need

| Purpose | Command | Expected |
| ------- | ------- | -------- |
| Dev Portal | `bun run dev:portal` | localhost:3002 |
| Dev backend | `bun run dev:backend` | Convex dev |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |

## Scope

**In scope**:

- `apps/portal/src/routes/w/$clientId/cms.tsx` — full Mon site editor
- `apps/portal/src/routes/op/clients/$clientId/cms.tsx` — desk management UI
- `apps/portal/src/lib/convex-queries.ts` — CMS query options
- `apps/portal/src/lib/convex-optimistic/` — optional optimistic updates for draft/publish (follow invoices pattern if added)
- `packages/backend/convex/cms.ts` — extend with image upload actions if not in plan 001
- `packages/backend/convex/cmsStorage.ts` (create) — image presign, variant stub (single WebP acceptable v1)
- `packages/backend/convex/lib/cms.ts` — preview JWT helpers

**Out of scope**:

- Needs Attention / Feature unlock wiring — plan 004
- CF Pages `/preview` token validation — plan 005 (Portal **issues** JWT; client site **validates**)
- CDN purge on publish — plan 005
- Insights feature

## Git workflow

- Branch: `feat/cms-003-portal-ui`
- Commits: `feat(portal): …`, `feat(backend): …` as needed

## Steps

### Step 1: Backend — preview JWT + image upload (if missing from 001)

Add to `packages/backend/convex/lib/cms.ts`:

- `signPreviewJwt(input: { slug, clientId, siteUrl }): string` — JWT ~15 min expiry
- Use env `CMS_PREVIEW_JWT_SECRET` (document in `.env.example`)
- Claims: `{ sub: slug, aud: "cms-preview", exp, iat }`

Add `packages/backend/convex/cmsStorage.ts` (`"use node"` action file):

- `prepareImageUpload` — validates client access, field is `image` type, returns presigned PUT URL for `cms/{slug}/assets/{fieldKey}/{uuid}.webp`
- `completeImageUpload` — verifies object exists via `headR2Object`, stores public URL in `cmsFieldValues.draftValue`
- v1 variant: accept client-uploaded image as-is OR single server-side resize if sharp available — **prefer accept-as-is** to limit scope; document max size from schema `maxWidth` as validation only

Add mutations/actions to `cms.ts`:

- `createPreviewLink` — `authedMutation`, returns `{ url: "${clientSiteUrl}/preview?token=${jwt}" }`
- Client site URL source: new optional field on `clients` table **OR** env default `CMS_PREVIEW_SITE_URL_TEMPLATE` — **prefer** new optional `clients.cmsSiteUrl` string set by Operator on desk (avoids global config). If adding column is too heavy, use desk UI local state + pass to mutation arg `siteBaseUrl` validated as https URL.

**Verify**: `bun run --filter @hezaerd/backend typecheck` → exit 0

### Step 2: Portal queries

In `apps/portal/src/lib/convex-queries.ts` add:

```typescript
export function cmsDeskQuery(slug: string) {
  return queryOptions({ ...convexQuery(api.cms.listSchemaForDesk, { slug }) });
}

export function cmsWorkspaceQuery(slug: string) {
  return queryOptions({ ...convexQuery(api.cms.listFieldsForWorkspace, { slug }) });
}
```

**Verify**: `bun run --filter @hezaerd/portal typecheck` → exit 0

### Step 3: Operator CMS desk page

Replace stub in `apps/portal/src/routes/op/clients/$clientId/cms.tsx`:

Sections:

1. **Deploy token** — list tokens, "Générer un token" button → modal showing plaintext once (copy), revoke button
2. **Schema table** — columns: field key, type, label (inline edit), default (text fields), deprecated badge
3. **Site URL** — input for preview base URL (store via new `cms.updateSiteUrl` mutation patching `clients.cmsSiteUrl` if column added)
4. **Publish state** — read-only: last version, publishedAt (from desk query)

Match visual patterns from Files desk routes (`apps/portal/src/routes/op/clients/$clientId/files/`).

Use `@hezaerd/ui` `Table`, `Button`, `Input`, `Dialog`.

**Verify**: Manual — open `/op/clients/{slug}/cms`, see schema rows after register-schema from plan 002

### Step 4: Client Mon site editor

Replace stub in `apps/portal/src/routes/w/$clientId/cms.tsx`:

- Load `cmsWorkspaceQuery`
- For each non-deprecated field:
  - **text**: `Input` or `Textarea` based on `constraints.multiline`, live char count vs `maxLength`
  - **image**: thumbnail if draft URL exists, upload button → presign flow (mirror Files slot upload UX)
- Debounced save calling `cms.upsertDraftText` or image complete action
- **Prévisualiser** button → `createPreviewLink`, opens new tab
- **Publier** button → confirm dialog → `cms.publish` → toast with version number
- Disable publish when `!hasUnpublishedChanges` (from query)

Calm layout: single column, max-w-2xl (keep existing wrapper).

**Verify**: Manual — edit hero.title, preview link generates URL with token param, publish updates R2

### Step 5: Error and loading states

- Feature gate already redirects if `!features.cms`
- Empty schema state: "Aucun champ configuré — déployez le site client pour enregistrer le schéma."
- Publish errors: show Convex error message in toast

**Verify**: `bun run check` → exit 0

## Test plan

Manual E2E (record in PR):

| Step | Actor | Action | Expected |
| ---- | ----- | ------ | -------- |
| 1 | OP | Enable CMS feature, generate deploy token | Token shown once |
| 2 | CI/dev | register-schema via template | Fields appear on desk |
| 3 | OP | Set label "Titre principal" on hero.title | Saved |
| 4 | Client | Edit text on Mon site | Draft saved |
| 5 | Client | Click Prévisualiser | URL with JWT opens |
| 6 | Client | Publish | Version increments, R2 updated |
| 7 | Client | Reload Mon site | hasUnpublishedChanges false |

## Done criteria

- [ ] Desk page: tokens, schema labels, site URL
- [ ] Mon site: text + image edit, preview link, publish
- [ ] Preview JWT signed with 15 min expiry (decode in jwt.io test — no secret in PR)
- [ ] `bun run typecheck` exit 0
- [ ] `bun run lint` exit 0
- [ ] No Needs Attention changes (plan 004)
- [ ] `plans/README.md` row 003 → DONE

## STOP conditions

- Plan 001 API missing required exports — STOP, list gaps.
- Image upload requires new R2 bucket — architecture uses same bucket, different prefix; STOP if bucket policy blocks public asset URLs.
- `@hezaerd/ui` lacks needed component — add via shadcn skill or use existing primitives; STOP if major design system work needed.

## Maintenance notes

- Preview JWT secret must match client site validator (plan 005) — coordinate env var names in both repos' docs.
- When adding markdown fields (future), Mon site form needs new field renderer — keep field-type switch centralized.
- Reviewers: ensure no "CMS" string in client-facing copy; check upload size limits match schema.
