import { defineSchedule } from "eve/schedules";

import { registerTelegramWebhook } from "../lib/register-telegram-webhook";

/** Self-heal webhook URL after domain/deploy drift (once daily UTC; Hobby cron limit). */
export default defineSchedule({
  cron: "0 12 * * *",
  async run() {
    const result = await registerTelegramWebhook();
    if (!result.ok) {
      console.error("[telegram-webhook]", result.error);
      return;
    }
    if (result.skipped) {
      return;
    }
    console.log(
      "[telegram-webhook]",
      result.alreadySet ? "already set" : "updated",
      result.url,
    );
  },
});
