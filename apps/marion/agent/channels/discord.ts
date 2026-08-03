import { commandInteractionMessage, discordChannel } from "eve/channels/discord";

import { isAllowedDiscordUser } from "../lib/discord-allowlist";
import { api, getConvex, marionServiceSecret } from "../lib/convex";

async function persistMessage(input: {
  discordUserId: string;
  eveSessionId?: string;
  role: "user" | "assistant";
  content: string;
  discordMessageId?: string;
}) {
  await getConvex().action(api.marionMemory.appendThreadMessage, {
    serviceSecret: marionServiceSecret(),
    discordUserId: input.discordUserId,
    eveSessionId: input.eveSessionId,
    role: input.role,
    content: input.content,
    discordMessageId: input.discordMessageId,
  });
}

export default discordChannel({
  onCommand: async (_ctx, interaction) => {
    if (!isAllowedDiscordUser(interaction.user.id)) {
      return null;
    }

    await getConvex().mutation(api.marionRead.registerDmChannel, {
      serviceSecret: marionServiceSecret(),
      discordUserId: interaction.user.id,
      dmChannelId: interaction.channelId,
    });

    const userText = commandInteractionMessage(interaction).trim();
    if (userText) {
      await persistMessage({
        discordUserId: interaction.user.id,
        role: "user",
        content: userText,
      });
    }

    return {
      auth: {
        principalId: interaction.user.id,
        principalType: "user",
        authenticator: "discord",
        attributes: {
          channel_id: interaction.channelId,
          guild_id: interaction.guildId ?? "",
        },
      },
      context: ["Canal: Discord DM operator Marion v1."],
    };
  },
  events: {
    async "message.completed"(eventData, _channel, ctx) {
      if (eventData.finishReason === "tool-calls") {
        return;
      }
      if (!eventData.message?.trim()) {
        return;
      }

      const auth = ctx.session.auth.current;
      const discordUserId = auth?.principalId;
      if (!discordUserId || auth?.authenticator !== "discord") {
        return;
      }

      await persistMessage({
        discordUserId,
        eveSessionId: ctx.session.id,
        role: "assistant",
        content: eventData.message,
      });
    },
  },
});
