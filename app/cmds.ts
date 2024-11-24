import { CommandOptions, DiscordUser } from "bdaybot/app/types.ts";
import { validateDate } from "bdaybot/app/utils.ts";
import {
  InteractionResponseType,
  MessageFlags,
} from "@discord-applications/app";

const kv = await Deno.openKv();

// When performing add, update, or remove commands, they must be done atomically to ensure
// that both primary and secondary keys point to the same data
// https://docs.deno.com/deploy/kv/manual/secondary_indexes/

export const handleAddCmd = async (options: CommandOptions) => {
  const { birthDate, discordId, serverId } = options;

  if (
    birthDate == undefined || discordId == undefined ||
    serverId == undefined
  ) {
    return sendMsg("Missing required fields.");
  }

  if (!validateDate(birthDate)) {
    return sendMsg("Invalid date format. Please use MM/DD/YYYY or MM-DD-YYYY.");
  }

  const key = [serverId, discordId];
  const value: DiscordUser = {
    birthDate: birthDate,
  };

  const res = await kv.atomic().check({ key, versionstamp: null }).set(
    key,
    value,
  ).commit();

  if (!res.ok) {
    return sendMsg("Your birthday already exists!");
  }
  return sendMsg("Added your birthday successfully!");
};

export const handleRemoveCmd = async (
  options: CommandOptions,
) => {
  const { discordId, serverId } = options;

  if (
    discordId == undefined || serverId == undefined
  ) {
    return sendMsg("Missing required fields.");
  }

  const key = [serverId, discordId];
  const getRes = await kv.get(key);

  const deleteRes = await kv.atomic().check({
    key,
    versionstamp: getRes?.versionstamp,
  }).delete(
    key,
  ).commit();

  if (!deleteRes.ok) {
    console.error("Remove command failed:", deleteRes);
    return sendMsg("Failed to remove your birthday!.");
  }
  return sendMsg("Birthday removed successfully!");
};

export const handleUpdateCmd = async (options: CommandOptions) => {
  const { birthDate: newBirthDate, discordId, serverId } = options;

  if (
    newBirthDate == undefined || discordId == undefined ||
    serverId == undefined
  ) {
    return sendMsg("Missing required fields.");
  }

  if (!validateDate(newBirthDate)) {
    return sendMsg("Invalid date format. Please use MM/DD/YYYY or MM-DD-YYYY.");
  }

  const key = [serverId, discordId];
  const value: DiscordUser = {
    birthDate: newBirthDate,
  };

  // Check if the user exists before updating
  const getRes = await kv.get(key);

  const updateRes = await kv.atomic().check({
    key,
    versionstamp: getRes?.versionstamp,
  }).set(key, value).commit();

  if (!updateRes.ok) {
    console.error("Update command failed:", updateRes);
    return sendMsg("Failed to update your birthday! :(");
  }
  return sendMsg("Birthday updated successfully!");
};

// Get all users' birthdates in the server
export const handleListCmd = async (serverId: string | undefined) => {
  if (serverId == undefined) {
    console.error("Missing server ID when running list command");
    return sendMsg("Missing server ID.");
  }

  const bdays = kv.list({ prefix: [serverId] });
  const users = [];

  for await (const bday of bdays) {
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const userId: string = bday.key[1];
    // @ts-ignore: ignore type issues when accessing value from Deno KV
    const birthDate: string = bday.value.birthDate;

    users.push({ userId, birthDate });
  }

  if (users.length === 0) {
    console.log("no birthdays found in this server:", serverId);
    return sendMsg("No birthdays found!");
  }

  const formattedBdays = users.map((user, idx) =>
    `${idx + 1}. <@${user.userId}>: ${user.birthDate}`
  ).join("\n");

  return sendMsg(formattedBdays);
};

// Get only one user's birthdate
export const handleGetCmd = async (options: CommandOptions) => {
  const { discordId, serverId } = options;

  if (
    discordId == undefined ||
    serverId == undefined
  ) {
    return sendMsg("Missing required fields");
  }

  const key = [serverId, discordId];
  const user = await kv.get(key);

  // @ts-ignore: ignore type issues when accessing value from Deno KV
  return sendMsg(`<@${discordId}>'s birthday is ${user?.value?.birthDate}.`);
};

// Relay data back to the user after invoking a command
export const sendMsg = (message: string) => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: message,
      // Ensure only the user who invoked the command can see the message
      // so we don't ping other users when running the list or get commands
      flags: MessageFlags.Ephemeral,
    },
  };
};
