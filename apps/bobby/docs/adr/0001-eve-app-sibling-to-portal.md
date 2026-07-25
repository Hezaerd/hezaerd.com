# Eve app as sibling to Portal

## Status

Accepted

## Context

Bobby is the Operator business co-pilot. Portal already hosts Operator and Client
shells. Eve needs its own `agent/` root, deploy, and channel secrets.

## Decision

Bobby is `apps/bobby` (Eve), a workspace sibling of Portal — not embedded in
`apps/portal`. Tools will call Operator-scoped backend APIs; Bobby does not
replace Portal chrome or Client Workspace.

## Consequences

Separate Vercel project (or filtered deploy), Node 24 for Eve, French-first
persona in `agent/instructions.md`. Portal stays the source of Operator UX;
Bobby is the co-pilot process beside it.
