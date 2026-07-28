# Site deploy signal via GitHub Action

Linked-site deploy status in Portal (Client Desk → Site) is reported by a
GitHub Action in each client repo: after `wrangler pages deploy`, CI POSTs
to a Convex HTTP endpoint with success/failure, commit sha, and preview URL.

Rejected Cloudflare-native relay (Event Subscriptions → account Worker →
Convex): fewer moving parts on the CF side, but adds a shared Worker and
project→client mapping; Pages has no direct outbound webhook URL like GitHub.
Per-repo Action matches the archived CMS CI pattern, keeps the payload
explicit, and debugs per client in Actions logs. See apps/portal/CONTEXT.md
(Site, Linked site).
