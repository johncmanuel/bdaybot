import { assertEquals } from "jsr:@std/assert";
import { getBirthdayUsers, insertBdayIntoKv } from "bdaybot/app/kv.ts";

// Test date verification for the cron job. Note that this doesn't validate the dates because
// these functions already assume the dates are valid since they will be used after the user performs slash commands and other validation logic
// This test is to verify that the cron job can correctly identify users with birthdays

Deno.test("verified birth dates", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "5678"];
  const birthDate = "05/01/2022";
  const today = new Date(2022, 5 - 1, 1); // months are 0-indexed in date objs
  const res = await insertBdayIntoKv(kv, key, birthDate);
  assertEquals(res, true);
  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 1);
  assertEquals(users[0], "5678");
  kv.close();
});

Deno.test("no birthdays today", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "5678"];
  const birthDate = "05/01/2022";
  const today = new Date(2022, 4 - 1, 30); // April 30
  const res = await insertBdayIntoKv(kv, key, birthDate);
  assertEquals(res, true);
  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 0);
  kv.close();
});

Deno.test("multiple users with the same birthday", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const birthDate = "07/15/2022";
  const today = new Date(2022, 7 - 1, 15); // July 15

  await insertBdayIntoKv(kv, key1, birthDate);
  await insertBdayIntoKv(kv, key2, birthDate);

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 2);
  assertEquals(users.includes("user1"), true);
  assertEquals(users.includes("user2"), true);
  kv.close();
});

Deno.test("users with different birth dates", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const birthDate1 = "03/01/2022";
  const birthDate2 = "04/01/2022";
  const today = new Date(2022, 3 - 1, 1); // March 1

  await insertBdayIntoKv(kv, key1, birthDate1);
  await insertBdayIntoKv(kv, key2, birthDate2);

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 1);
  assertEquals(users.includes("user1"), true);
  assertEquals(users.includes("user2"), false);
  kv.close();
});

Deno.test("users with valid dates and different delimiters", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const birthDate1 = "06/10/2022";
  const birthDate2 = "06-10-2022";
  const today = new Date(2022, 6 - 1, 10); // June 10

  await insertBdayIntoKv(kv, key1, birthDate1);
  await insertBdayIntoKv(kv, key2, birthDate2);

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 2);
  assertEquals(users.includes("user1"), true);
  assertEquals(users.includes("user2"), true);
  kv.close();
});

Deno.test("empty database", async () => {
  const kv = await Deno.openKv(":memory:");
  const today = new Date(2022, 5 - 1, 1); // May 1

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 0);
  kv.close();
});

Deno.test("invalid birth date in database", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "user1"];
  const invalidBirthDate = "invalid-date";
  const today = new Date(2022, 5 - 1, 1); // May 1

  // Simulate adding invalid date directly
  await kv.set(key, { birthDate: invalidBirthDate });

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 0); // Invalid dates should be ignored
  kv.close();
});

// TODO: Modify the actual functions being tested to account for leap year cases. We still want to
// notify the server about their birthdays. We leave no one behind!

Deno.test("leap year birthday (Feb 29 on leap year)", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "user1"];
  const birthDate = "02/29/2000"; // Leap year birthdate
  const leapYearToday = new Date(2024, 2 - 1, 29); // Feb 29 on a leap year (2024)

  await insertBdayIntoKv(kv, key, birthDate);

  const users = await getBirthdayUsers(kv, "1234", leapYearToday);
  assertEquals(users.length, 1); // Should notify on Feb 29 in a leap year
  assertEquals(users.includes("user1"), true);
  kv.close();
});

Deno.test("leap year birthday (Feb 29 on non-leap year)", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "user1"];
  const birthDate = "02/29/2000"; // Leap year birthdate
  const nonLeapYearToday = new Date(2023, 2 - 1, 29); // Feb 29 on a non-leap year (2023)

  await insertBdayIntoKv(kv, key, birthDate);

  const users = await getBirthdayUsers(kv, "1234", nonLeapYearToday);
  assertEquals(users.length, 0); // Should NOT notify on Feb 29 in a non-leap year
  assertEquals(users.includes("user1"), false);
  kv.close();
});

Deno.test("leap year birthday (Feb 28 on non-leap year)", async () => {
  const kv = await Deno.openKv(":memory:");
  const key = ["1234", "user1"];
  const birthDate = "02/29/2000"; // Leap year birthdate
  const nonLeapYearToday = new Date(2023, 2 - 1, 28); // Feb 28 on a non-leap year (2023)

  await insertBdayIntoKv(kv, key, birthDate);

  const users = await getBirthdayUsers(kv, "1234", nonLeapYearToday);
  assertEquals(users.length, 1); // Should notify on Feb 28 in a non-leap year
  assertEquals(users.includes("user1"), true);
  kv.close();
});

Deno.test("multiple users with leap year birthdays", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const leapYearBirthDate = "02/29/2000"; // Leap year birthday
  const todayLeapYear = new Date(2024, 2 - 1, 29); // Feb 29 on a leap year
  const todayNonLeapYear = new Date(2023, 2 - 1, 28); // Feb 28 on a non-leap year

  await insertBdayIntoKv(kv, key1, leapYearBirthDate);
  await insertBdayIntoKv(kv, key2, leapYearBirthDate);

  // Check on a leap year
  const usersLeapYear = await getBirthdayUsers(kv, "1234", todayLeapYear);
  assertEquals(usersLeapYear.length, 2); // Both users should be notified on Feb 29 in a leap year

  // Check on a non-leap year
  const usersNonLeapYear = await getBirthdayUsers(kv, "1234", todayNonLeapYear);
  assertEquals(usersNonLeapYear.length, 2); // Both users should be notified on Feb 28 in a non-leap year
  kv.close();
});

Deno.test("users with mixed valid and invalid birthdays", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const validBirthDate = "08/25/2022"; // Valid birthday for user1
  const invalidBirthDate = "02/30/2022"; // Invalid birthday for user2
  const today = new Date(2022, 8 - 1, 25); // August 25

  await insertBdayIntoKv(kv, key1, validBirthDate);
  await kv.set(key2, { birthDate: invalidBirthDate }); // Simulating an invalid date directly in KV

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 1); // Only user1 should be notified
  assertEquals(users.includes("user1"), true);
  assertEquals(users.includes("user2"), false);
  kv.close();
});

Deno.test("users with overlapping and non-overlapping dates", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["1234", "user2"];
  const key3 = ["1234", "user3"];
  const birthDate1 = "10/20/2022"; // user1 and user2 share the same date
  const birthDate2 = "10/20/2022";
  const birthDate3 = "11/15/2022"; // user3 has a different date
  const today = new Date(2022, 10 - 1, 20); // October 20

  await insertBdayIntoKv(kv, key1, birthDate1);
  await insertBdayIntoKv(kv, key2, birthDate2);
  await insertBdayIntoKv(kv, key3, birthDate3);

  const users = await getBirthdayUsers(kv, "1234", today);
  assertEquals(users.length, 2); // Only user1 and user2 should be notified
  assertEquals(users.includes("user1"), true);
  assertEquals(users.includes("user2"), true);
  assertEquals(users.includes("user3"), false);
  kv.close();
});

Deno.test("users with the same birthday in different prefixes", async () => {
  const kv = await Deno.openKv(":memory:");
  const key1 = ["1234", "user1"];
  const key2 = ["5678", "user2"];
  const birthDate = "09/10/2022"; // Both users have the same birthday
  const today = new Date(2022, 9 - 1, 10); // September 10

  await insertBdayIntoKv(kv, key1, birthDate);
  await insertBdayIntoKv(kv, key2, birthDate);

  const users1 = await getBirthdayUsers(kv, "1234", today);
  const users2 = await getBirthdayUsers(kv, "5678", today);

  assertEquals(users1.length, 1); // Only user1 should be notified under prefix "1234"
  assertEquals(users1.includes("user1"), true);

  assertEquals(users2.length, 1); // Only user2 should be notified under prefix "5678"
  assertEquals(users2.includes("user2"), true);

  kv.close();
});
