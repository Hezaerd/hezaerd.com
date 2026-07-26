# Bobby

Operator-facing business co-pilot agent (Eve). Lives in `apps/bobby`. Not Portal
UI.

## Language

**Bobby**:
The durable AI agent that helps the Operator run the practice: Client Desk
queues, Practice Cockpit, invoices, and related Operator workflows. Talks to the
Operator (French-first). Tools call practice systems; does not impersonate Clients.
_Avoid_: Generic assistant, admin bot, Customer support agent, Bonny, in-app Client messaging

**Operator Agent API** (planned):
Authenticated tool surface Bobby uses to read/write practice data (Convex /
HTTP), scoped to Operator role, with human-in-the-loop for sensitive writes.
_Avoid_: Scraping Portal chrome; acting as Client; unauthenticated service calls

**Long-term memory** (v0):
Local durable store (`data/memory.json`) for Operator facts + lessons.
Injected each turn via dynamic instructions; written via `remember` /
`save_lesson` / `forget`. Later: Convex-backed, auth-scoped.
_Avoid_: Session-only `defineState` for cross-session memory; inventing memories

## Relationships

- **Bobby → Portal / backend**: Bobby consumes Operator-scoped APIs; Portal remains the workspace UI (ADR-0003 Client Desk).
- **Bobby ↛ Client**: No Client-facing chat channel in v0; communication stays outside Portal.
- **Bobby ≠ Bonny**: Separate agent/identity later for life OS.
