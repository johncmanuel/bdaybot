// Assumes MM-DD or MM/DD format
type LeapYearDates =
  | "02/28"
  | "03/01"
  | "02-28"
  | "03-01";

// Main entity in DB
export interface DiscordUser {
  birthDate: string; // For comparison in the business logic, use datetime objects
  alternateDate?: LeapYearDates; // For leap year people
}

export interface CommandOptions {
  birthDate?: string | undefined; // Label this optional for the remove command
  discordId: string | undefined;
  serverId: string | undefined;
}
