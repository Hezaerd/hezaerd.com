# Client access and slug URLs

Portal v1 stores **access in the app**, not in WorkOS Organizations.

## Access model

- `users.role`: `operator` | `client` (app-owned, synced on login/webhook)
- `users.clientId`: optional link to one Client (the Client seat)
- Operators are granted via Convex env `OPERATOR_EMAILS` (v1: `hezaerd@hezaerd.com` only)
- Client seats **auto-bind** when a User’s email exactly matches exactly one Client’s `contactEmail`

## URLs

- Route param `$clientId` is the Client **slug** (e.g. `river-cafe`), not the Convex `_id`
- Slugs are unique among Clients; display names are not route keys

## Client lifecycle

- Operators create Clients before any seat exists (`contactEmail` may have no login yet)
- At most one seat per Client in v1; no membership table or invites

See apps/portal/CONTEXT.md for glossary terms.
