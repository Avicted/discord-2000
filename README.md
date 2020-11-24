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

## Media
Place .ogg audio files in the media directory
These files can be played back in a voice channel with the command:
```!play <file_name>```

The .ogg audio files are automatically listed in the ```!help``` command.
