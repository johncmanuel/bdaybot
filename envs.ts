export const DISCORD_APP_ID = Deno.env.get("DISCORD_APPLICATION_ID")!;

export const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;

export const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN")!;

export const DISCORD_GUILD_ID = Deno.env.get("DISCORD_GUILD_ID")!;

export const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL")!;

export const USE_PST_PDT: boolean =
  Deno.env.get("USE_PST_PDT")?.toLowerCase() === "true";

// Specified role that can use the slash commands
export const DISCORD_ALLOWED_ROLE = Deno.env.get("DISCORD_ALLOWED_ROLE")!;
