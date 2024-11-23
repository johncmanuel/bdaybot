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
