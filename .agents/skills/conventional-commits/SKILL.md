---
name: conventional-commits
description: Conventional Commits for monorepos (`type(scope): subject`). Use when the user asks to commit, draft a commit message, or fix commit message wording.
---

Draft one line: `type(scope): subject` — omit `(scope)` when none fits.

Allowed `type` and `scope` values live in [`commitlint.config.mjs`](../../../commitlint.config.mjs) — read that file before drafting; do not invent enums.

## Craft

| Piece | Rule |
| --- | --- |
| **scope** | Workspace package folder (`apps/brand` → `brand`). Omit when the change spans packages or only touches the repo root. |
| **subject** | Imperative mood, lowercase start, no trailing period. Name the *why* (or outcome), not a file inventory. |

## Examples

```
feat(brand): add case study grid
docs: improve design docs
fix(content): correct case study slugs
chore: bump workspace tooling
```

## Done when

**scope** is honest to the path set, **subject** still reads clearly to someone who never saw the diff, and the line passes:

```sh
echo '<message>' | bunx commitlint
```
