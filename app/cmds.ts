import { DiscordUser } from "bdaybot/app/types.ts";
import { validateDate } from "bdaybot/app/utils.ts";
import { InteractionResponseType } from "@discord-applications/app";

const kv = await Deno.openKv();

export interface DiscordUserKey {
  discordId: string;
  discordUsername: string;
  serverId: string;
}

export interface CommandOptions {
  birthDate: string;
  discordId: string;
  discordUsername: string;
  serverId: string;
}

export const handleAddCmd = async (options: CommandOptions) => {
  const { birthDate, discordId, discordUsername, serverId } = options;

  if (!validateDate(birthDate)) {
    return sendMsg("Invalid date format. Please use MM/DD/YYYY or MM-DD-YYYY.");
  }

  const key = [serverId, discordId, discordUsername];
  const value: DiscordUser = {
    birthDate: birthDate,
  };

  const res = await kv.atomic().check({ key, versionstamp: null }).set(
    key,
    value,
  ).commit();

  if (!res.ok) {
    return sendMsg("User's birthday already exists.");
  }
  return sendMsg("User added successfully.");
};

export const handleRemoveCmd = async (
  discordId: string,
  discordUsername: string,
  serverId: string,
) => {
  const key = [serverId, discordId, discordUsername];

  const deleteRes = await kv.atomic().check({ key, versionstamp: null }).delete(
    key,
  ).commit();

  if (!deleteRes.ok) {
    return sendMsg("Failed to remove user's birthdate.");
  }
  return sendMsg("User's birthdate removed successfully.");
};

export const handleUpdateCmd = async (options: CommandOptions) => {
  const { birthDate: newBirthDate, discordId, discordUsername, serverId } =
    options;

  if (!validateDate(newBirthDate)) {
    return sendMsg("Invalid date format. Please use MM/DD/YYYY or MM-DD-YYYY.");
  }

  const key = [serverId, discordId, discordUsername];
  const value: DiscordUser = {
    birthDate: newBirthDate,
  };

  const updateRes = await kv.atomic().check({
    key,
    versionstamp: null,
  }).set(key, value).commit();

  if (!updateRes.ok) {
    return sendMsg("Failed to update user's birth date.");
  }
  return sendMsg("User's birth date updated successfully.");
};

// Get all users' birthdates in the server
export const handleListCmd = async (serverId: string) => {
  const entries = kv.list({ prefix: [serverId] });
  const users = [];
  for await (const entry of entries) {
    users.push([entry.key, entry.value]);
  }
  return sendMsg(JSON.stringify(users));
};

// Get only one user's birthdate
export const handleGetCmd = async (options: CommandOptions) => {
  const { discordId, discordUsername, serverId } = options;
  const key = [serverId, discordId, discordUsername];
  const user = await kv.get(key);
  return sendMsg(JSON.stringify(user));
};

// Relay data back to the user after invoking a command
export const sendMsg = (data: string) => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: data,
    },
  };
};
