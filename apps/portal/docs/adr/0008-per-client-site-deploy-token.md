# Per-client deploy token for Site CI webhooks

GitHub Actions in client repos authenticate deploy-status POSTs to Convex
with a deploy token scoped to one linked site. Tokens are issued and
revoked from Client Desk Settings; stored as repo secrets (e.g.
`PORTAL_DEPLOY_TOKEN`).

Rejected shared account secret: one leak compromises every client site.
Rejected GitHub OIDC for v1: more plumbing for marginal gain while Portal
and CI are both operator-controlled. Same pattern as archived CMS deploy
tokens. See apps/portal/CONTEXT.md (Linked site).
