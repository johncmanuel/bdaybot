import {
  ApplicationCommandOptionType,
  AppSchema,
} from "@discord-applications/app";

export const bdaySchemaName = "bday";
export const bdaySubCmdGroupName = "user";

export const bdaySchema = {
  chatInput: {
    name: bdaySchemaName,
    description: "Birthday commands stuff",
    groups: {
      user: {
        description: "User commands",
        subcommands: {
          add: {
            description: "Add your birthday to the database.",
            options: {
              bday: {
                type: ApplicationCommandOptionType.String,
                description: "Your birthday in MM/DD/YYYY format",
                required: true,
              },
            },
          },
          rm: {
            description: "Remove your birthday from the database.",
          },
          update: {
            description: "Update your birthday in the database.",
            options: {
              bday: {
                type: ApplicationCommandOptionType.String,
                description: "Your new birthday MM/DD/YYYY format",
                required: true,
              },
            },
          },
          "all": {
            description: "Get all birthdays in the server you're in.",
          },
          "get": {
            description: "Get a user's birthday from the database.",
            options: {
              // options that involve users only give the user ID rather than the user object
              user: {
                type: ApplicationCommandOptionType.User,
                description: "User of the birthday to get",
                required: true,
              },
            },
          },
        },
      },
    },
  },
} as const satisfies AppSchema;
