import {
  handleAddCmd,
  handleGetCmd,
  handleListCmd,
  handleRemoveCmd,
  handleUpdateCmd,
  sendMsg,
} from "bdaybot/app/cmds.ts";
import {
  DISCORD_ALLOWED_ROLE,
  DISCORD_APP_ID,
  DISCORD_PUBLIC_KEY,
  DISCORD_TOKEN,
  USE_PST_PDT,
} from "bdaybot/envs.ts";
import { bdaySchema } from "bdaybot/app/schema/bday.ts";
import { createApp } from "@discord-applications/app";
import { cronjob } from "bdaybot/app/cron.ts";
import { getUtcHourInPdtOrPst } from "bdaybot/app/utils.ts";

// NOTE: Deno Cron does not take time zones into account. So, may need to
// dynamically adjust for PST/PDT. PST/PDT is chosen specifically since all my friends
// live in the Pacific Time Zone. Since others may use the same code for their own birthday
// bots, an environment variable will determine if the cron job will use PST/PDT or UTC time every midnight
const utcHour = USE_PST_PDT ? getUtcHourInPdtOrPst() : 0;
console.log(`UTC hour to run bday cron job every day: ${utcHour}`);
Deno.cron(
  "Get all birthdays every midnight Pacific Time",
  `0 ${utcHour} * * *`,
  // "* * * * *",
  async () => {
    console.log("Running cron job at:", new Date());
    await cronjob();
  },
);

if (import.meta.main) {
  const bday = await createApp(
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
        // @ts-ignore: weird typing issue with discord app library
        add(interaction) {
          const birthDate = interaction.data.parsedOptions?.bday;
          const discordId = interaction.member?.user.id;
          const serverId = interaction.guild_id;
          const roles = interaction.member?.roles;
          if (!roles?.includes(DISCORD_ALLOWED_ROLE)) {
            return sendMsg(
              "You do not have permission to use this command.",
            );
          }
          return handleAddCmd({
            birthDate,
            discordId,
            serverId,
          });
        },
        // @ts-ignore: weird typing issue with discord app library
        rm(interaction) {
          const discordId = interaction.member?.user.id;
          const serverId = interaction.guild_id;
          const roles = interaction.member?.roles;
          if (!roles?.includes(DISCORD_ALLOWED_ROLE)) {
            return sendMsg(
              "You do not have permission to use this command.",
            );
          }
          return handleRemoveCmd({
            discordId,
            serverId,
          });
        },
        // @ts-ignore: weird typing issue with discord app library
        update(interaction) {
          const birthDate = interaction.data.parsedOptions?.bday;
          const discordId = interaction.member?.user.id;
          const serverId = interaction.guild_id;
          const roles = interaction.member?.roles;
          if (!roles?.includes(DISCORD_ALLOWED_ROLE)) {
            return sendMsg(
              "You do not have permission to use this command.",
            );
          }
          return handleUpdateCmd({
            birthDate,
            discordId,
            serverId,
          });
        },
        // @ts-ignore: weird typing issue with discord app library
        "all"(interaction) {
          const serverId = interaction.guild_id;
          const roles = interaction.member?.roles;
          if (!roles?.includes(DISCORD_ALLOWED_ROLE)) {
            return sendMsg(
              "You do not have permission to use this command.",
            );
          }
          return handleListCmd(
            serverId,
          );
        },
        // @ts-ignore: weird typing issue with discord app library
        "get"(interaction) {
          const discordUser = interaction.data.parsedOptions?.user;
          const serverId = interaction.guild_id;
          const roles = interaction.member?.roles;
          if (!roles?.includes(DISCORD_ALLOWED_ROLE)) {
            return sendMsg(
              "You do not have permission to use this command.",
            );
          }
          return handleGetCmd({ serverId, discordId: discordUser });
        },
      },
    },
  );

  Deno.serve(bday);
}
