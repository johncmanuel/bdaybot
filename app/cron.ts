import { DISCORD_GUILD_ID, DISCORD_WEBHOOK_URL } from "bdaybot/envs.ts";

const kv = await Deno.openKv();

export const cronjob = async () => {
  const bdays = kv.list({ prefix: [DISCORD_GUILD_ID] });
  const users = [];

  for await (const bday of bdays) {
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const userId: string = bday.key[1];
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const birthDate: string = bday.value.birthDate;

    users.push({ userId, birthDate });
  }

  if (users.length === 0) {
    console.log("no birthdays today for", new Date());
    return;
  }

  const formattedBdays = users.map((user, idx) =>
    `${idx + 1}. <@${user.userId}>: ${user.birthDate}`
  ).join("\n");

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `SAY HAPPY BIRTHDAY TO THESE PEOPLE!!!:\n${formattedBdays}`,
    }),
  });
};
