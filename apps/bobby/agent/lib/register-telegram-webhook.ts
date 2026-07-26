/** Production Telegram webhook for Bobby. Override with TELEGRAM_WEBHOOK_URL. */
const DEFAULT_PRODUCTION_WEBHOOK_URL =
  "https://bobby.hezaerd.com/eve/v1/telegram";

export type RegisterTelegramWebhookResult =
  | { ok: true; url: string; skipped: true; reason: string }
  | { ok: true; url: string; skipped: false; alreadySet: boolean }
  | { ok: false; error: string };

function resolveWebhookUrl(): string | null {
  const explicit = process.env.TELEGRAM_WEBHOOK_URL?.trim();
  if (explicit) {
    return explicit;
  }

  // Never point the live bot at a preview/dev host.
  if (process.env.VERCEL_ENV === "production") {
    return DEFAULT_PRODUCTION_WEBHOOK_URL;
  }

  return null;
}

/**
 * Points BotFather's webhook at Bobby's production Telegram route.
 * Safe to call repeatedly (no-ops when already correct).
 */
export async function registerTelegramWebhook(): Promise<RegisterTelegramWebhookResult> {
  const url = resolveWebhookUrl();
  if (!url) {
    return {
      ok: true,
      url: "",
      skipped: true,
      reason: "not production and TELEGRAM_WEBHOOK_URL unset",
    };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN?.trim();
  if (!token || !secret) {
    return {
      ok: false,
      error: "missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET_TOKEN",
    };
  }

  const infoResponse = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`,
  );
  const infoBody: unknown = await infoResponse.json();
  if (
    isTelegramOk(infoBody) &&
    typeof infoBody.result === "object" &&
    infoBody.result !== null &&
    "url" in infoBody.result &&
    infoBody.result.url === url
  ) {
    return { ok: true, url, skipped: false, alreadySet: true };
  }

  const setResponse = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ["message", "callback_query"],
      }),
    },
  );
  const setBody: unknown = await setResponse.json();
  if (!isTelegramOk(setBody)) {
    return {
      ok: false,
      error: `setWebhook failed: ${JSON.stringify(setBody)}`,
    };
  }

  return { ok: true, url, skipped: false, alreadySet: false };
}

function isTelegramOk(
  body: unknown,
): body is { ok: true; result?: unknown } {
  return (
    typeof body === "object" &&
    body !== null &&
    "ok" in body &&
    body.ok === true
  );
}
