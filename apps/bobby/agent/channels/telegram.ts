import { defaultTelegramAuth, telegramChannel } from "eve/channels/telegram";

/**
 * Comma-separated Telegram user ids allowed to talk to Bobby.
 * Empty = anyone who can message the bot (dev only — set this in production).
 */
const allowedUserIds = new Set(
  (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0),
);

export default telegramChannel({
  // Without @: used for group @mentions /commands. Private DMs work either way.
  botUsername: process.env.TELEGRAM_BOT_USERNAME || undefined,
  uploadPolicy: {
    allowedMediaTypes: ["image/*", "application/pdf"],
    maxBytes: 10 * 1024 * 1024,
  },
  async onMessage(ctx, message) {
    if (message.from?.isBot === true || message.chat.type !== "private") {
      return null;
    }

    const text = message.text || message.caption;
    if (text.trim().length === 0 && message.attachments.length === 0) {
      return null;
    }

    if (allowedUserIds.size > 0) {
      const userId = message.from?.id;
      if (!userId || !allowedUserIds.has(userId)) {
        return null;
      }
    }

    await ctx.telegram.startTyping();
    return { auth: defaultTelegramAuth(message) };
  },
});
