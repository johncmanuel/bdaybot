import { DiscordUser } from "bdaybot/app/types.ts";

export const insertBdayIntoKv = async (
  kv: Deno.Kv,
  key: string[],
  birthDate: string,
): Promise<boolean> => {
  const delim = birthDate.includes("/") ? "/" : "-";
  const [month, day] = birthDate.split(delim).map(Number);
  const newBirthDate = `${month}${delim}${day}`;
  const value: DiscordUser = {
    birthDate: newBirthDate,
  };
  const res = await kv.atomic().check({ key, versionstamp: null }).set(
    key,
    value,
  ).commit();
  return res.ok;
};

export const getBirthdayUsers = async (
  kv: Deno.Kv,
  prefix: string,
  today: Date,
): Promise<string[]> => {
  const bdays = kv.list({ prefix: [prefix] });
  const users = [];
  const todayMonth = today.getMonth(); // 0-indexed: January = 0
  const todayDay = today.getDate();

  for await (const bday of bdays) {
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const userId: string = bday.key[1];
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const birthDate: string = bday.value.birthDate;

    const delim = birthDate.includes("/") ? "/" : "-";
    const [month, day] = birthDate.split(delim).map(Number);
    // console.log(month, todayMonth, day, todayDay);

    if (month - 1 === todayMonth && day === todayDay) {
      users.push(userId);
    }
  }

  return users;
};
