import { Client, Intents } from 'discord.js'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
import { checkTimezoneSettings, loadCommandFiles, loadEvents } from './utils'
import 'reflect-metadata'
import { IAudioQueueEntry } from './interfaces/audioQueueEntry'
import Discord from 'discord.js'
import { ICommand } from './interfaces/command'
export const client: Client = new Discord.Client({
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        // Intents.FLAGS.GUILD_PRESENCES,
        
    ],
    partials: [
        'CHANNEL',
        'GUILD_MEMBER',
        'MESSAGE',
    ],
})
export const clientCommands = new Discord.Collection<string, ICommand>()

// Global queue for storing audio sources
export const audioQueue: Queue<IAudioQueueEntry> = new Queue()

// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

checkTimezoneSettings()
loadCommandFiles()
loadEvents()

client.login(process.env.TOKEN)
