import { Message, VoiceChannel } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { audioQueue } from '../main'
import { Queue } from '../queue'
import ytdlCoreDiscord from 'ytdl-core-discord'
import ytdl from 'ytdl-core'
import yts from 'yt-search'

const prefix = process.env.CMD_PREFIX as string

module.exports = class Youtube implements ICommand {
    _name: string = 'p'
    _description: string = 'Plays youtube videos as music'
    _audioQueue: Queue<Map<string, VoiceChannel>> = audioQueue

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    private noResult(message: Message, searchQuery: string) {
        message.reply(`Did not find any Youtube video with the search query: ${searchQuery}`)
    }

    public async execute(message: Message): Promise<void> {
        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)

        if (args.length < 2) {
            message.reply('Please enter something that you can search on Youtube')
            return
        }

        const searchQuery: string = message.content
            .slice(prefix.length)
            .trim()
            .slice(prefix.length + 1, message.content.length)

        console.log(`[Youtube execute] searchQuery: ${searchQuery}`)

        if (message.member?.voice.channel) {
            const voiceChannel: VoiceChannel = message.member.voice.channel

            // Search youtube and try to find a video matching the searchQuery

            const result = await yts(searchQuery)

            const videos = result.videos.slice(0, 3)

            if (videos.length <= 0) {
                this.noResult(message, searchQuery)
                return
            }

            const firstResult: yts.VideoSearchResult = videos[0]
            const url: string = firstResult.url

            firstResult.title

            // Queue a new sound / some music to be played
            const queueEntry: Map<string, VoiceChannel> = new Map()
            this._audioQueue.push(queueEntry.set(url, voiceChannel))
        } else {
            message.reply('You need to join a voice channel first!')
        }
    }
}
