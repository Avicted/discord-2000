import fs from 'fs'
import { Message, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import { ICommand } from "../interfaces/command";
import { Queue } from '../queue';
import { audioQueue } from '../main';
const prefix = process.env.cmdPrefix as string

module.exports = class Play implements ICommand {
    _name: string = 'play'
    _description: string = 'Plays a stored audio file'
    _audioQueue: Queue<Map<string, VoiceChannel>> = audioQueue

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
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
            const voiceChannel: VoiceChannel = message.member.voice.channel

            // Check if the file exists?
            try {
                if (fs.existsSync(`media/${fileName}.ogg`)) {
                    // file exists
                } else {
                    message.reply(`Play Command: The file: ${fileName} does not exist`)
                    return
                }
            } catch (err) {
                console.error(err)
                return
            }

            const queueEntry: Map<string, VoiceChannel> = new Map()
            this._audioQueue.push(queueEntry.set(fileName, voiceChannel))
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }
}
