import { defineSchedule } from "eve/schedules";

import discord from "../channels/discord";
import { api, marionAction } from "../lib/convex";
import { isMorningDigestHour, isQuietHours, montrealDayKey } from "../lib/quiet-hours";

export default defineSchedule({
  /** Daily 13:00 UTC ≈ 8h Montreal (EST). Hobby Vercel rejects sub-daily crons. */
  cron: "0 13 * * *",
  async run({ receive, waitUntil, appAuth }) {
    if (!isQuietHours()) {
      return;
    }

    const target = await marionAction(api.marionMemory.getOperatorDeliveryTarget, {});
    if (!target) {
      return;
    }

    if (isMorningDigestHour()) {
      waitUntil(
        (async () => {
          await receive(discord, {
            message: [
              "Digest matin Portal — utilise skill triage-desk.",
              "1. get_cockpit_stats",
              "2. list_waiting_on_client (global)",
              "3. list_waiting_on_operator (global)",
              "Synthèse courte en puces, tutoiement, pas de filler.",
              "Si rien d'urgent, dis-le en une phrase.",
            ].join("\n"),
            target: { channelId: target.dmChannelId },
            auth: appAuth,
          });
          await marionAction(api.marionMemory.recordDigest, {});
        })(),
      );
      return;
    }

    const dayKey = montrealDayKey();
    const pingBudget = await marionAction(api.marionMemory.tryRecordProactivePing, { dayKey });
    if (!pingBudget.allowed) {
      return;
    }

    const snapshot = await marionAction(api.marionRead.getDigestSnapshot, {});
    const waitingCount = snapshot.waitingOnClient.length + snapshot.waitingOnOperator.length;
    if (waitingCount === 0) {
      return;
    }

    waitUntil(
      receive(discord, {
        message: [
          "Ping proactif Portal (budget quotidien restant).",
          `Waiting on Client: ${snapshot.waitingOnClient.length}, Waiting on Operator: ${snapshot.waitingOnOperator.length}.`,
          "Si un item mérite attention maintenant, une puce — sinon réponds NO_PING et termine sans message Discord.",
        ].join("\n"),
        target: { channelId: target.dmChannelId },
        auth: appAuth,
      }),
    );
  },
});
