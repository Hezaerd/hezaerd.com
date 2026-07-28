# Site git activity via webhook and bootstrap fetch

Recent git activity on Client Desk → Site (branch + last five commits) is
maintained by a GitHub `push` webhook into Convex, with a one-time GitHub
API bootstrap when a linked site is saved (repo + default branch). Convex
re-fetches from the API on force-push or ambiguous webhook payloads.

Rejected poll-only (cron): unnecessary API traffic when push events are
available. Rejected webhook-only without bootstrap: Site would stay empty
until the next push after linking an already-live site. See
apps/portal/CONTEXT.md (Site, Linked site).
