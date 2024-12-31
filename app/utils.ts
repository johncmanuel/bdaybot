// Assumes date is in MM/DD/YYYY or MM-DD-YYYY format
export const validateDate = (date: string): boolean => {
  const delim = date.includes("/") ? "/" : "-";

  const r = new RegExp(
    `^(0[1-9]|1[0-2])${delim}(0[1-9]|[12][0-9]|3[01])${delim}\\d{4}$`,
  );

  if (!r.test(date)) {
    return false;
  }

  const [month, day, year] = date.split(delim).map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};

// https://stackoverflow.com/a/16353241
export const isLeapYear = (year: number): boolean => {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
};

// Claude AI helped me with calculating the PST/PDT offset. Though, not sure
// if they would be correct, mainly because of my suspicion of the date calculations
// using .toLocaleString(). After running a few tests outside of this project, it seems to work.
// We'll see... once we test in production >:)

// Calculate UTC hour based on Pacific time
// It must either be 7 (for PDT) or 8 (for PST)
export const getUtcHourInPdtOrPst = (d?: Date): number => {
  const pacificOffset = getPacificUtcOffset(d);
  return (24 + pacificOffset) % 24;
};

// Check if in PST (UTC-8) or PDT (UTC-7)
export const getPacificUtcOffset = (d?: Date): number => {
  const locale = "en-US";
  const date = d || new Date();
  const pacificTime = new Date(
    date.toLocaleString(locale, { timeZone: "America/Los_Angeles" }),
  );
  const utcTime = new Date(date.toLocaleString(locale, { timeZone: "UTC" }));
  return (utcTime.getTime() - pacificTime.getTime()) / (60 * 60 * 1000);
};
