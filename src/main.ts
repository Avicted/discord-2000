import { Client, VoiceChannel } from 'discord.js'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
import { checkTimezoneSettings, loadCommandFiles, loadEvents } from './utils'
import { DatabaseContext } from './persistance/databaseContext'
const Discord = require('discord.js')
export const client: Client = new Discord.Client()
export const clientCommands = new Discord.Collection()

// Global database connection
const databaseContext: DatabaseContext = new DatabaseContext()
databaseContext.initialize()

// Global queue for storing audio sources
export const audioQueue: Queue<Map<string, VoiceChannel>> = new Queue()

// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

checkTimezoneSettings()
loadCommandFiles()
loadEvents()

client.login(process.env.token)
