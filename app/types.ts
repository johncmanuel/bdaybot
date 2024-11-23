// Main entity in DB
export interface DiscordUser {
  birthDate: string; // For comparison in the business logic, use datetime objects
}

export interface DiscordUserKey {
  discordId: string;
  serverId: string;
}

export interface CommandOptions {
  birthDate?: string | undefined; // Label this optional for the remove command
  discordId: string | undefined;
  serverId: string | undefined;
}
