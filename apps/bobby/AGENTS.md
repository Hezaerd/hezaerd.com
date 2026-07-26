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

Production host: `https://bobby.hezaerd.com`.

Webhook registration (no Bot token on the laptop needed):

1. Prefer: `POST https://bobby.hezaerd.com/eve/v1/telegram/ensure-webhook`
   — uses Vercel env; only ever points at production (or `TELEGRAM_WEBHOOK_URL`).
2. Daily schedule `register-telegram-webhook` self-heals after domain drift.
3. Manual Bot API `setWebhook` still works if you have the token locally.

```bash
curl -X POST "https://bobby.hezaerd.com/eve/v1/telegram/ensure-webhook"
```
