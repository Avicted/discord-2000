import { VoiceChannel } from 'discord.js'

export interface IAudioQueueEntry {
    title: string
    url?: string
    voiceChannel: VoiceChannel
    image?: string
}
