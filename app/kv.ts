import { DiscordUser } from "bdaybot/app/types.ts";
import { isLeapYear } from "bdaybot/app/utils.ts";

// Perform preprocessing on the date before inserting into the KV
export const insertBdayIntoKv = async (
  kv: Deno.Kv,
  key: string[],
  birthDate: string,
): Promise<boolean> => {
  // Assumes that the date is in MM/DD/YYYY or MM-DD-YYYY format
  const delim = birthDate.includes("/") ? "/" : "-";
  const [month, day, year] = birthDate.split(delim).map(Number);

  const newBirthDate = `${month}${delim}${day}`;
  const value: DiscordUser = {
    birthDate: newBirthDate,
  };

  // Celebrate the user's birthday on February 28th if they were born on February 29th on a leap year
  if (month === 2 && day === 29 && isLeapYear(year)) {
    value.alternateDate = "02/28";
  }

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
  const bdays = kv.list<DiscordUser>({ prefix: [prefix] });
  const users = [];
  const todayMonth = today.getMonth(); // 0-indexed: January = 0
  const todayDay = today.getDate();

  for await (const bday of bdays) {
    const userId = bday.key[1].toString();
    const birthDate = bday.value.birthDate;
    const alternateDate = bday.value.alternateDate;

    const delim = birthDate.includes("/") ? "/" : "-";
    const [month, day] = birthDate.split(delim).map(Number);
    // console.log(month, todayMonth, day, todayDay);

    // Account for leap year people
    if (alternateDate) {
      // console.log(alternateDate);
      const [altMonth, altDay] = alternateDate.split(delim).map(Number);
      // Check if it's the user's birthday today
      if (altMonth - 1 === todayMonth && altDay === todayDay) {
        users.push(userId);
        continue;
      }
    }

    if (month - 1 === todayMonth && day === todayDay) {
      users.push(userId);
    }
  }

  return users;
};

// export const getLeap
