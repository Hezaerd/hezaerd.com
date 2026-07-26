# Bobby (eve Agent App)

Operator business co-pilot. Domain: `CONTEXT.md`. Requires **Node 24**.

Before writing eve code, read the installed package docs (`node_modules/eve/docs/`
from this app or the workspace root after `bun install`). Fallback: https://eve.dev/docs.

## Telegram (Operator phone)

Channel: `agent/channels/telegram.ts` → `POST /eve/v1/telegram`.

Env (Vercel project `bobby`, Production + Preview):

- `TELEGRAM_BOT_TOKEN` — from BotFather
- `TELEGRAM_WEBHOOK_SECRET_TOKEN` — random secret you choose; must match `setWebhook`
- `TELEGRAM_ALLOWED_USER_IDS` — your Telegram numeric user id (comma-separated)
- `TELEGRAM_BOT_USERNAME` — bot username without `@` (optional; needed for groups)

Production host: `https://bobby.hezaerd.com`. After any domain change, re-run
`setWebhook` (Eve does not call it for you). Old hosts like
`clyde-delta-nine.vercel.app` stop receiving updates.

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://bobby.hezaerd.com/eve/v1/telegram",
       "secret_token":"'"$TELEGRAM_WEBHOOK_SECRET_TOKEN"'",
       "allowed_updates":["message","callback_query"]}'
```

Verify: `curl -sS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq .`
