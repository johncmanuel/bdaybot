import { DISCORD_GUILD_ID, DISCORD_WEBHOOK_URL } from "bdaybot/envs.ts";

const kv = await Deno.openKv();

export const cronjob = async () => {
  const bdays = kv.list({ prefix: [DISCORD_GUILD_ID] });
  const users = [];
  const today = new Date();

  for await (const bday of bdays) {
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const userId: string = bday.key[1];
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const birthDate: string = bday.value.birthDate;

    // Birthday assumed to be valid since slash commands validated them already
    const delim = birthDate.includes("/") ? "/" : "-";
    const [month, day, year] = birthDate.split(delim).map(Number);
    const bdayDate = new Date(year, month - 1, day);

    // Only add user to list if it's their birthday
    if (
      bdayDate.getFullYear() === today.getFullYear() &&
      bdayDate.getMonth() === today.getMonth() &&
      bdayDate.getDate() === today.getDate()
    ) {
      users.push(userId);
    }
  }

  if (users.length === 0) {
    console.log("no birthdays today for", new Date());
    return;
  }

  const formattedBdays = users.map((userId, idx) => `${idx + 1}. <@${userId}>`)
    .join("\n");

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content:
        `YOOOO! SAY HAPPY BIRTHDAY TO THESE PEOPLE!!!\n${formattedBdays}`,
    }),
  });

  if (!res.ok) {
    console.error("Failed to send to webhook:", res.statusText);
    return;
  }
  console.log("Successfully sent to webhook");
};
