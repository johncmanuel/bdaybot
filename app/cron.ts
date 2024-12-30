import { DISCORD_GUILD_ID, DISCORD_WEBHOOK_URL } from "bdaybot/envs.ts";
import { getBirthdayUsers } from "bdaybot/app/kv.ts";

const kv = await Deno.openKv();

export const cronjob = async () => {
  const today = new Date();
  const users = await getBirthdayUsers(today, DISCORD_GUILD_ID, kv);

  if (users.length === 0) {
    console.log("no birthdays today for", today);
    return;
  }

  const formattedBdays = users.map((userId, idx) => `${idx + 1}. <@${userId}>`)
    .join("\n");

  await sendToWebhook(formattedBdays);
};

export const sendToWebhook = async (content: string) => {
  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `YOOOO! SAY HAPPY BIRTHDAY TO THESE PEOPLE!!!\n${content}`,
    }),
  });

  if (!res.ok) {
    console.error("Failed to send to webhook:", res.statusText);
    return;
  }
  console.log("Successfully sent to webhook");
};
