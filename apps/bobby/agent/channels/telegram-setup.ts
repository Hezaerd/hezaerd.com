import { defineChannel, POST } from "eve/channels";

import { registerTelegramWebhook } from "../lib/register-telegram-webhook";

/**
 * Phone-friendly / agent-triggerable webhook registration.
 * Only ever points the bot at TELEGRAM_WEBHOOK_URL or production bobby.hezaerd.com
 * (uses server env for the bot token — callers cannot redirect the bot elsewhere).
 */
export default defineChannel({
  routes: [
    POST("/eve/v1/telegram/ensure-webhook", async (_req, { waitUntil }) => {
      const resultPromise = registerTelegramWebhook();
      waitUntil(resultPromise);
      const result = await resultPromise;
      return Response.json(result, { status: result.ok ? 200 : 500 });
    }),
  ],
});
