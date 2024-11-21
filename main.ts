// TODO: get interactions server running, add crud operations for adding discord users' bdays
// then get cron job via deno cron running that queries deno kv db for bdays and sends a message to the
// discord channel
//
// NOTE: data schema for bdays: discord id, bday date, discord username

import {
  DISCORD_APP_ID,
  DISCORD_PUBLIC_KEY,
  DISCORD_TOKEN,
} from "bdaybot/envs.ts";

import type { AppSchema } from "@discord-applications/app";
import { createApp, InteractionResponseType } from "@discord-applications/app";

// Put here or inside the cron job?
const db = await Deno.openKv();

Deno.cron(
  "Get all birthdays every midnight from DB and send message via Discord webhook",
  "0 0 * * *",
  async () => {
    // do something here xd
  },
);

export const highFiveSchema = {
  user: { name: "High Five" },
} as const satisfies AppSchema;

if (import.meta.main) {
  const highFive = await createApp(
    {
      schema: highFiveSchema,
      applicationID: DISCORD_APP_ID,
      publicKey: DISCORD_PUBLIC_KEY,
      // @ts-ignore: should be valid typing here for the discord token
      register: { token: DISCORD_TOKEN },
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    (interaction) => {
      const targetUser =
        interaction.data.resolved.users[interaction.data.target_id];
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content:
            `<@${interaction.member?.user.id}> high-fived <@${targetUser.id}>!`,
        },
      };
    },
  );

  // Start the server.
  Deno.serve(highFive);
}
