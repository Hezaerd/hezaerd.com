# Linked site — CI deploy workflow

Copy this workflow into a client repo (e.g. `steven-etienne`) after linking the site in Portal **Paramètres** and generating `PORTAL_DEPLOY_TOKEN`.

## Secrets (GitHub repo)

| Secret | Source |
|--------|--------|
| `PORTAL_DEPLOY_TOKEN` | Portal → Client → Paramètres → Générer un token |
| `PORTAL_DEPLOY_WEBHOOK_URL` | `https://<deployment>.convex.site/site/deploy` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard |

## GitHub App webhook (org)

Point the GitHub App webhook (or org webhook) at:

`https://<deployment>.convex.site/site/github-webhook`

Subscribe to **push** events. Set `GITHUB_WEBHOOK_SECRET` in Convex to match.

## Convex environment

| Variable | Purpose |
|----------|---------|
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | PEM private key (`\n` escaped) |
| `GITHUB_APP_INSTALLATION_ID` | Installation on client org |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret |

## Workflow

Save as `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Deploy to Cloudflare Pages
        id: deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          npx wrangler pages deploy dist --project-name=YOUR_CF_PAGES_PROJECT --branch=master
        continue-on-error: true

      - name: Notify Portal (success)
        if: steps.deploy.outcome == 'success'
        env:
          PORTAL_DEPLOY_WEBHOOK_URL: ${{ secrets.PORTAL_DEPLOY_WEBHOOK_URL }}
          PORTAL_DEPLOY_TOKEN: ${{ secrets.PORTAL_DEPLOY_TOKEN }}
        run: |
          curl -fsS -X POST "$PORTAL_DEPLOY_WEBHOOK_URL" \
            -H "Authorization: Bearer $PORTAL_DEPLOY_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"success\",\"commitSha\":\"${{ github.sha }}\"}"

      - name: Notify Portal (failure)
        if: steps.deploy.outcome == 'failure'
        env:
          PORTAL_DEPLOY_WEBHOOK_URL: ${{ secrets.PORTAL_DEPLOY_WEBHOOK_URL }}
          PORTAL_DEPLOY_TOKEN: ${{ secrets.PORTAL_DEPLOY_TOKEN }}
        run: |
          curl -fsS -X POST "$PORTAL_DEPLOY_WEBHOOK_URL" \
            -H "Authorization: Bearer $PORTAL_DEPLOY_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"failure\",\"commitSha\":\"${{ github.sha }}\"}"

      - name: Fail job if deploy failed
        if: steps.deploy.outcome == 'failure'
        run: exit 1
```

Replace `YOUR_CF_PAGES_PROJECT`, output directory (`dist`), and branch name to match the client repo.

## Portal UI

1. **Paramètres** → lier repo, branche, URL prod → générer token deploy.
2. **Site** → uptime (cron 5 min), git (webhook + bootstrap), dernier deploy (CI).

See `apps/portal/CONTEXT.md` (Site, Linked site) and ADRs 0005–0008 under `apps/portal/docs/adr/`.
