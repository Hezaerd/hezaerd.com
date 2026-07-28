# GitHub App for linked-site integration

Portal reads git activity for linked client sites via a GitHub App installed
on a dedicated client-projects org (not a personal PAT). The App grants
`contents:read` for bootstrap/re-fetch API calls; push webhooks are verified
via the App's delivery secret.

Rejected fine-grained PAT: manual rotation, repo-by-repo scope drift, and a
forced rework when repos move from a personal account into the client org.
One App install covers current and future client repos under that org. See
apps/portal/CONTEXT.md (Linked site).
