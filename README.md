# Discord-2000 bot

Create a .env file with the contents from the .env.example, provide the secrets.

## Development

Develop inside a remote docker container in VSCode.

Start typescript in watch mode, recompile and restart nodejs on file changes:

`npm run dev`


### Media
Place .ogg audio files in the media directory
These files can be played back in a voice channel with the command:
```!play <file_name>```

The .ogg audio files are automatically listed in the ```!help``` command.