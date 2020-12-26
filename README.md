# Discord-2000 bot
This is an example Discord bot where new commands are easy to add in code. New commands are automatically added to the bots list of commands. No need to declare anywhere that a new command has been implemented.

## Development

Create a .env file with the contents from the .env.example, provide the secrets.
Develop inside a remote docker container in VSCode.

Start typescript in watch mode, recompile and restart nodejs on file changes:

`npm run dev`


## New commands
To create a new command:
Create a new .ts file in src/commands. Create a class that implements the ICommand interface.
The most basic example can be found in ```src/command/ping.ts```

## New Events
To create a new event:
Create a new .ts file in src/events. Create a class that implements the IEvent interface.
All events and their function parameters are available in the discord.js documentation. The most basic example can be found in ```src/events/ready.ts```

The name of a typescript event file should match an event from discord.js. This is how the application knows which event you are implementing in a particular file.

## Media
Place .ogg audio files in the media directory
These files can be played back in a voice channel with the command:
```!play <file_name>```

The .ogg audio files are automatically listed in the ```!help``` command.
