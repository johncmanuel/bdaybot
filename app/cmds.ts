const kv = await Deno.openKv();

export interface AddCmdOptions {
  bday: string;
  discordId: string;
  discordUsername: string;
}
export const handleAddCmd = async (options: AddCmdOptions) => {
  const { bday, discordId, discordUsername } = options;

  if (!validateDate(bday)) {
    return "Invalid date format. Please use MM/DD/YYYY.";
  }

  const user = await kv.get([discordId]);
  if (user) {
    return "User already exists.";
  }
};

// Assumes date is in MM/DD/YYYY or MM-DD-YYYY format
export const validateDate = (date: string): boolean => {
  const r = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
  if (!r.test(date)) {
    return false;
  }

  const delim = date.includes("/") ? "/" : "-";
  const [month, day, year] = date.split(delim).map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
};
