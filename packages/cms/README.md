# @hezaerd/cms

SDK for Hezaerd client sites: declare CMS fields in code, sync schema at deploy time, render baked content from R2 in production.

Production routes must **never** import or call Convex. They read a published JSON snapshot only.

## Install (GitHub Packages)

```ini
# .npmrc (client repo or CI)
@hezaerd:registry=https://npm.pkg.github.com
```

```bash
# Local / CI — read token from GitHub PAT with read:packages
export NODE_AUTH_TOKEN=ghp_...
bun add @hezaerd/cms
```

Publish from this monorepo (operator-managed secret):

```bash
export NODE_AUTH_TOKEN=ghp_... # write:packages
cd packages/cms && bun publish
```

## Declare fields (code-first)

```typescript
import type { CmsField } from "@hezaerd/cms";

export const CMS_SLUG = "river-cafe";

export const CMS_FIELDS: CmsField[] = [
  { fieldKey: "hero.title", type: "text", constraints: { maxLength: 80 } },
  {
    fieldKey: "hero.photo",
    type: "image",
    constraints: { aspect: "16/9", maxWidth: 1920, priority: true },
  },
];
```

## CI: register schema

After build, POST field definitions to Portal Convex (deploy token per client):

```typescript
import { registerFields } from "@hezaerd/cms/register";

await registerFields({
  slug: CMS_SLUG,
  fields: CMS_FIELDS,
  convexSiteUrl: process.env.CONVEX_SITE_URL!,
  deployToken: process.env.CMS_DEPLOY_TOKEN!,
});
```

See `templates/client-site/scripts/register-schema.ts` for a runnable script.

## Build-time snapshot (production HTML)

Set `CMS_SNAPSHOT_URL` to the public URL of `cms/{slug}/published/latest.json` (R2 or CDN).

```typescript
import { fetchPublishedSnapshot } from "@hezaerd/cms";

const snapshot = await fetchPublishedSnapshot(process.env.CMS_SNAPSHOT_URL!);
```

404 → empty fields (first deploy before first publish).

## React render helpers

Snapshot renderers for static/SSR HTML — not live editors:

```tsx
import { EditableText, EditableImage } from "@hezaerd/cms/react";

<EditableText fieldKey="hero.title" snapshot={snapshot} as="h1" />
<EditableImage fieldKey="hero.photo" snapshot={snapshot} alt="Hero" priority />
```

Draft preview (`/preview?token=…`) is handled in the client site SSR layer (plan 005); these components accept whichever snapshot props you pass at render time.

## Starting point

Copy or mirror `templates/client-site` from this monorepo (`@hezaerd/client-site-template`).

`CMS_SLUG` must match `clients.slug` in Portal.
