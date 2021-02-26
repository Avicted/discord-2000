import { Client, VoiceChannel } from 'discord.js'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
import { checkTimezoneSettings, loadCommandFiles, loadEvents } from './utils'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
const Discord = require('discord.js')
export const client: Client = new Discord.Client()
export const clientCommands = new Discord.Collection()

// Global queue for storing audio sources
export const audioQueue: Queue<Map<string, VoiceChannel>> = new Queue()

// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

// Register a new database connection to the connectionManager
createConnection()

checkTimezoneSettings()
loadCommandFiles()
loadEvents()

client.login(process.env.TOKEN)
