# Hezaerd

Monorepo for the public Hezaerd brand site and personal portfolio.

## Apps

| App                  | Domain                | Port |
| -------------------- | --------------------- | ---- |
| `@hezaerd/brand`     | hezaerd.com           | 3000 |
| `@hezaerd/portfolio` | portfolio.hezaerd.com | 3001 |

## Packages

| Package            | Purpose                  |
| ------------------ | ------------------------ |
| `@hezaerd/ui`      | Shared tokens / `cn`     |
| `@hezaerd/config`  | Shared TypeScript base   |
| `@hezaerd/content` | Typed case-study content |

## Commands

```bash
bun install

bun run dev:brand
bun run dev:portfolio

bun run build
bun run check
```

## Deployment

Create one Vercel project per app:

- `apps/brand` → hezaerd.com
- `apps/portfolio` → portfolio.hezaerd.com
