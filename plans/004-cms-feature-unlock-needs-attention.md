# Plan 004: CMS feature unlock + Needs Attention queues

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5b4f224..HEAD -- packages/backend/convex/clients.ts packages/backend/convex/cms.ts apps/portal/src/lib/convex-queries.ts apps/portal/src/components/shell/needs-attention-list.tsx`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-cms-convex-backend.md, plans/003-portal-cms-editing-preview-publish.md
- **Category**: direction
- **Planned at**: commit `5b4f224`, 2026-07-28

## Why this matters

When an Operator enables CMS for a Client, the product spec (`apps/portal/CONTEXT.md`) requires a **one-time Feature unlock** Needs Attention: « Mon site est prêt… ». Separately, when draft content differs from published, Clients should see **publish-ready** Needs Attention on Home. Client Desk should show corresponding **Waiting on Client** rows for Operators. Today `setFeature` explicitly does **not** create these rows.

## Current state

`setFeature` mutation:

```350:375:packages/backend/convex/clients.ts
/** Toggle a Client Feature (Operator). Does not create Needs Attention rows. */
export const setFeature = operatorMutation({
  args: {
    slug: v.string(),
    feature: v.union(v.literal("insights"), v.literal("cms")),
    enabled: v.boolean(),
  },
  // ... patches features only
});
```

Needs Attention aggregation (Portal):

```70:79:apps/portal/src/lib/convex-queries.ts
export function needsAttentionQuery(slug: string) {
  return queryOptions({
    queryKey: ["needsAttention", slug],
    queryFn: async ({ client }) => {
      const [invoiceItems, fileItems] = await Promise.all([
        client.fetchQuery(invoiceNeedsAttentionQuery(slug)),
        client.fetchQuery(fileNeedsAttentionQuery(slug)),
      ]);
      return [...invoiceItems, ...fileItems] as NeedsAttentionItem[];
```

CMS kind UI config already exists (`kind: "cms"`, `area: "cms"`).

**Product rules** (from CONTEXT.md):

- Feature unlock: dismissible, one-time, not recurring
- Label client: **Mon site** / « Nouvelle fonctionnalité » for unlock
- Waiting on Client on Desk until Client has seen unlock
- Publish-ready CMS draft = Needs Attention kind `cms`, CTA « Relire les changements »

## Commands you will need

| Purpose | Command | Expected |
| ------- | ------- | -------- |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Dev | `bun run dev:portal` + `bun run dev:backend` | manual QA |

## Scope

**In scope**:

- `packages/backend/convex/schema.ts` — extend `clientNotifications.kind` union OR add `cmsFeatureUnlocks` table (see Step 1 decision)
- `packages/backend/convex/clients.ts` — hook `setFeature` when enabling `cms`
- `packages/backend/convex/cms.ts` — `listNeedsAttention`, `listWaitingOnClient`, `acknowledgeFeatureUnlock`
- `apps/portal/src/lib/convex-queries.ts` — wire CMS into aggregators
- `apps/portal/src/routes/w/$clientId/cms.tsx` — dismiss unlock on first visit (call acknowledge)

**Out of scope**:

- Insights feature unlock (same pattern later)
- Email notifications
- Persistent nav badges

## Git workflow

- Branch: `feat/cms-004-needs-attention`

## Steps

### Step 1: Choose storage for feature unlock state

**Option A (preferred)** — extend `clientNotifications`:

Add kind `cms_feature_unlock` to union in schema + validators.

Insert row when CMS enabled:

```typescript
{
  kind: "cms_feature_unlock",
  title: "Mon site est prêt",
  description: "Vous pouvez modifier le contenu de votre site et le publier.",
}
```

Dismiss via existing `files.dismissNotification` pattern — **or** add generic `clientNotifications.dismiss` if CMS shouldn't import from files module.

**Option B** — field on `clients`: `cmsUnlockSeenAt` — simpler but mixes feature state into clients table.

Implement Option A unless schema migration conflict — keep notifications reusable for Insights later (`insights_feature_unlock`).

**Verify**: schema compiles after codegen

### Step 2: Feature unlock on enable

In `clients.setFeature`, when `args.feature === "cms" && args.enabled === true`:

1. Check no existing undismissed `cms_feature_unlock` notification for client
2. Insert notification row

When **disabling** CMS: do **not** delete notifications (historical); optional: cancel undismissed unlock only.

Do **not** create notification on re-enable if one was already dismissed (one-time per enable cycle — if product wants re-notify on re-enable, insert only when transitioning false→true AND no prior dismissed row for this enable event; v1: insert only on false→true, skip if undismissed exists).

**Verify**: Enable CMS on test client → row in `clientNotifications`

### Step 3: Publish-ready Needs Attention

In `packages/backend/convex/cms.ts` add `listNeedsAttention`:

- Client role only, `features.cms` true
- If `hasUnpublishedChanges` (same logic as workspace query): return one item:

```typescript
{
  id: `cms-unpublished-${client._id}`,
  title: "Modifications prêtes à publier",
  description: "Relisez vos changements sur Mon site avant publication.",
  clientId: client.slug,
  area: "cms",
  kind: "cms",
}
```

Add `listWaitingOnClient` for Operator desk:

- Same condition → href `/op/clients/${slug}/cms`

Map `cms_feature_unlock` notifications in `cms.listNeedsAttention` OR extend `files.listNeedsAttention` — **prefer central aggregator** in new `cms.listNeedsAttention` returning both cms draft + feature unlock mapped to `kind: "feature"` with `area: "cms"`:

Feature unlock item:

```typescript
{
  kind: "feature",
  area: "cms",
  title: notification.title,
  // ...
}
```

**Verify**: draft edit creates Needs Attention row on Client Home

### Step 4: Wire Portal aggregators

Update `needsAttentionQuery`:

```typescript
const [invoiceItems, fileItems, cmsItems] = await Promise.all([
  // ...
  client.fetchQuery(cmsNeedsAttentionQuery(slug)),
]);
return [...invoiceItems, ...fileItems, ...cmsItems];
```

Update `waitingOnClientQuery` similarly with `api.cms.listWaitingOnClient`.

Extend `files.listNeedsAttention` notification mapping if unlock stays in files query — **avoid duplicate** unlock rows.

**Verify**: Client Home shows unlock after enable; shows cms item after draft edit

### Step 5: Acknowledge unlock on Mon site visit

In `apps/portal/src/routes/w/$clientId/cms.tsx`, on mount:

- Call `cms.acknowledgeFeatureUnlock({ slug })` mutation that dismisses undismissed `cms_feature_unlock` notifications

Use `useEffect` + single fire; don't block render.

**Verify**: Visit Mon site → unlock disappears from Home; Waiting on Client clears on desk

## Test plan

| Case | Expected |
| ---- | -------- |
| Enable CMS | Feature unlock on Home |
| Dismiss via Mon site visit | Gone from Home + desk queue |
| Edit draft without publish | cms Needs Attention appears |
| Publish | cms Needs Attention disappears |
| Re-toggle CMS off/on | New unlock only if product rule says so (v1: one unlock per false→true) |

## Done criteria

- [ ] `setFeature(cms, true)` creates unlock notification
- [ ] Unpublished draft surfaces Needs Attention + Waiting on Client
- [ ] Aggregators include CMS queries
- [ ] Mon site visit dismisses unlock
- [ ] `bun run typecheck` exit 0
- [ ] `plans/README.md` row 004 → DONE

## STOP conditions

- Duplicate Needs Attention rows from files + cms queries — STOP and consolidate.
- `setFeature` optimistic update in Portal doesn't refresh notifications — fix optimistic layer or document manual refresh (acceptable v1 if hard).

## Maintenance notes

- Mirror pattern for Insights when grilled.
- Feature unlock copy is product-owned — keep strings in one place for i18n later.
- Reviewers: confirm Operators never see Client Needs Attention items in wrong shell.
