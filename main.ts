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
import { bdaySchema } from "bdaybot/app/schema/bday.ts";
import { createApp } from "@discord-applications/app";

// Put here or inside the cron job?
const db = await Deno.openKv();

Deno.cron(
  "Get all birthdays every midnight from DB and send message via Discord webhook if one is today",
  "0 0 * * *",
  async () => {
    // do something here xd
  },
);

if (import.meta.main) {
  const highFive = await createApp(
    {
      schema: bdaySchema,
      applicationID: DISCORD_APP_ID,
      publicKey: DISCORD_PUBLIC_KEY,
      token: DISCORD_TOKEN,
      register: true,
      invite: { path: "/invite", scopes: ["applications.commands"] },
    },
    {
      user: {
        add(interaction) {
          const bday = interaction.options.bday;
        },
        rm(interaction) {
        },
        update(interaction) {
        },
        "get-all"(interaction) {
        },
        "get-user"(interaction) {
        },
      },
    },
  );

  Deno.serve(highFive);
}
