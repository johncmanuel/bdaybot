export interface DiscordUser {
  discordId: string;
  username: string;
  birthday: string; // For comparison in the business logic, use datetime objects
}
