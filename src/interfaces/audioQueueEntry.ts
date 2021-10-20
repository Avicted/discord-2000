import { StageChannel, VoiceChannel } from 'discord.js'

export interface IAudioQueueEntry {
    title: string
    url?: string
    voiceChannel: VoiceChannel | StageChannel
    image?: string
}
