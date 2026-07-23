## Agent skills

### Default output (ADHD)

**Always** read and follow `.agents/skills/i-have-adhd/SKILL.md` before answering. It is the default response skill for this repo: lead with the next action, number multi-step work, restate state across turns, suppress tangents. Stays on until the user says "stop adhd mode" or "normal mode".

### Issue tracker

Issues live in this repo's GitHub Issues (via `gh`). See `docs/agents/issue-tracker.md`.

### Domain docs

Multi-context: root `CONTEXT-MAP.md` points at per-context `CONTEXT.md` files; system-wide ADRs in `docs/adr/`. See `docs/agents/domain.md`.

### Conventional commits

Commit messages use Conventional Commits (`type(scope): subject`). Allowed types/scopes are in `commitlint.config.mjs`. See `.agents/skills/conventional-commits/SKILL.md`.
