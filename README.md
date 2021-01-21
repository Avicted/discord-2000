# Discord-2000 bot

## Description
This application is a Discord bot where new commands and events are easy to implement. New commands and events are automatically added to the bot. No need to declare anywhere that a new command or event has been implemented.

### Prerequisites
* Docker
* VSCode
    * Plugin: 
        Name: Remote - Containers VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers

---

## Development

**Open the workspace in VSCode `/workspace.code.workspace`**

Create an .env file with the contents from the .env.example, provide the secrets. Configure all variables inside `< >` to your liking.
Develop inside a remote docker container in VSCode.

Start typescript in watch mode, recompile and restart nodejs on file changes:

`npm run dev`

---

### New commands
To create a new command:
Create a new .ts file in src/commands. Create a class that implements the ICommand interface.
The most basic example can be found in `src/command/ping.ts`

### New Events

To create a new event:
Create a new .ts file in src/events. Create a class that implements the IEvent interface.
All events and their function parameters are available in the discord.js documentation. The most basic example can be found in `src/events/ready.ts`

**The name of a typescript event file should match an event from discord.js.** This is how the application knows which event you are implementing in a particular file.

### Audio files (the !play command)

Place .ogg audio files in the media directory
These files can be played back in a voice channel with the command:
`!play <file_name>`
The .ogg audio files are automatically listed in the `!help` command.

---

## Production

Create an .env file with the contents from the .env.example, provide the secrets. Configure all variables inside the placeholder `< >` to your liking.

Run the application with docker-compose:
* `docker-compose up -d --build`. 
* The logs of the app can be tailed with `docker-compose logs --follow`

---

## Database migrations

All existing database migrations are run against the database on application start.

### Database backup dump
`docker exec -t <container_name> pg_dumpall -c -U <postgres_username> > dump_`\``date +%d-%m-%Y"_"%H_%M_%S`\``.sql`

### Database backup restore (Note: not best practice)
Requires that you manually remove the DROP USER statement from the SQL dump when you want to restore.

`cat your_dump.sql | docker exec -i <container_id> psql -U <postgres_username> <database_name>`

---
### Adding or modifying an entity

Create a new migration:
`npm run typeorm migration:generate -- -n InitialUserModel`

Build the codebase including the typescript migrations:
`npm run compile`

Show all migrations and their current state
`npm run typeorm migration:show`

Run migrations:

`npm run typeorm migration:run`
