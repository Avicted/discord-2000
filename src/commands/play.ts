import fs from 'fs'
import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { ICommand } from "../interfaces/command";
const prefix = process.env.cmdPrefix as string

class Queue<T> {
    _store: T[] = []

    push(val: T) {
        this._store.push(val)
    }

    pop(): T | undefined {
        return this._store.shift()
    }

    length(): number {
        return this._store.length
    }
}

module.exports = class Play implements ICommand {
    _name: string = 'play'
    _description: string = 'Plays a stored audio file'

    // @TODO: this should be global queue
    _audioQueue: Queue<string> = new Queue()

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    get audioQueue(): Queue<string> {
        return this._audioQueue
    }

    public async execute(message: Message) {
        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)

        if (args.length < 2) {
            message.reply('Please enter a audio clip as the parameter');
            return
        }

        const fileName: string = args[1].toLowerCase()

        if (message.member?.voice.channel) {
            const connection: VoiceConnection = await message.member.voice.channel.join();

            // We assume that the file name exists
            this._audioQueue.push(fileName)
            console.log(`this._audioQueue`)
            console.log({
                _audioQueue: this._audioQueue,
                length: this._audioQueue.length(),
            })

            message.channel.send(`Now playing... ${fileName}`)

            if (this._audioQueue.length() <= 1) {
                this.playLocalFile(connection)
            }
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }

    private playLocalFile(connection: VoiceConnection): void {
        console.log(this._audioQueue._store[0])
        const fileName: string = this._audioQueue._store[0]
        const dispatcher: StreamDispatcher = connection.play(fs.createReadStream(`media/${fileName}.ogg`), {
            volume: 0.5,
        })

        dispatcher.on('finish', (): void => {
            this._audioQueue.pop()
            if (this._audioQueue.length() < 1) {
                dispatcher.destroy() // end the stream
            } else {
                this.playLocalFile(connection)
            }
            console.log(`Finished playing: ${fileName}`)
        })
    }

    // @TODO: implement
    private playYoutubeAudio(searchQuery: string): void {

    }
}