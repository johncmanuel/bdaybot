import { assertEquals } from "jsr:@std/assert";
import { validateDate } from "bdaybot/app/utils.ts";

Deno.test("validateDate - valid dates in MM/DD/YYYY format", () => {
  assertEquals(validateDate("01/01/2024"), true);
  assertEquals(validateDate("12/31/2023"), true);
  assertEquals(validateDate("02/29/2024"), true); // Leap year
});

Deno.test("validateDate - valid dates in MM-DD-YYYY format", () => {
  assertEquals(validateDate("01-01-2024"), true);
  assertEquals(validateDate("12-31-2023"), true);
  assertEquals(validateDate("02-29-2024"), true); // Leap year
});

Deno.test("validateDate - invalid dates", () => {
  assertEquals(validateDate("13/01/2024"), false); // Invalid month
  assertEquals(validateDate("02/30/2024"), false); // Invalid day
  assertEquals(validateDate("02/29/2023"), false); // Non-leap year
  assertEquals(validateDate("00/15/2024"), false); // Invalid month
  assertEquals(validateDate("12/00/2024"), false); // Invalid day
});

Deno.test("validateDate - invalid formats", () => {
  assertEquals(validateDate("01-01-24"), false); // Wrong year format
  assertEquals(validateDate("2024-01-01"), false); // Wrong format
  assertEquals(validateDate("01/01-2024"), false); // Mixed delimiters
  assertEquals(validateDate("01012024"), false); // Missing delimiters
});

Deno.test("validateDate - edge cases", () => {
  assertEquals(validateDate(""), false); // Empty string
  assertEquals(validateDate("  "), false); // Whitespace
  assertEquals(validateDate("MM/DD/YYYY"), false); // Template text
  assertEquals(validateDate("02/29/2000"), true); // Leap year divisible by 400
  assertEquals(validateDate("02/29/1900"), false); // Not a leap year
});
