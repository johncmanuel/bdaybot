# bdaybot

Discord bot that sends a message to a channel when it's someone's birthday!

## Setup

1. Install [Deno](https://docs.deno.com/runtime/getting_started/installation/) and [ngrok](https://download.ngrok.com/). Alternatively, you can use [Devbox to install them instead](https://www.jetify.com/docs/devbox/installing_devbox/)
2. Set up the environment variables as shown in [.env.example](https://github.com/johncmanuel/bdaybot/blob/master/.env.example) in another file, `.env`. See [your Discord application after creating it](https://discord.com/developers/applications/) to get the secrets. 
3. Run `deno install` to install dependencies
4. Run the server with `deno task start` and run ngrok using `deno task ngrok`. **Set the URL found in the ngrok window under the Interactions Endpoint URL in the General tab of your Discord app.**
5. Invite your app/bot to a test Discord server using `<your ngrok server URL>/invite`
6. Test the commands to see if they work! 

For production, make sure to replace the interaction endpoint URL specified in your Discord application with the actual server URL.

## Commands

1. `/bday user add`
2. `/bday user get`
3. `/bday user list`
4. `/bday user rm`
5. `/bday user update`

## Birthday Notification

A Deno Cron routine will run every midnight either in UTC (default) or PST/PDT. The cron job sends a message via a Discord webhook that notifies others about someone's birthday for that particular day. PST/PDT time can be activated by setting `USE_PST_PDT` to `"true"`. 
