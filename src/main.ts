import fs from 'fs'
import { Client, VoiceChannel } from 'discord.js'
import { createCommand, ICommand, ICommandConstructor } from './interfaces/command'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
import { checkTimezoneSettings } from './utils'
import { createEvent, IEvent, IEventConstructor } from './interfaces/event'
const Discord = require('discord.js')
export const client: Client = new Discord.Client()
export const clientCommands = new Discord.Collection()

// Global queue for storing audio sources
export const audioQueue: Queue<Map<string, VoiceChannel>> = new Queue()

// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

// Should the bot post user presence updates to a predefined text channel?
checkTimezoneSettings()

// Bind all commands
async function loadCommandFiles(): Promise<any> {
    const commandFiles = fs.readdirSync('dist/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        try {
            const command: ICommand = await require(`./commands/${file}`)
            const newCommand: ICommand = createCommand(command as unknown as ICommandConstructor, command.name, command.description)
            clientCommands.set(newCommand.name, newCommand)
        } catch (error) {
            console.error(`loadCommandFiles: ${error}`)
        }
    }
}

loadCommandFiles()


// Bind all events
async function loadEvents(): Promise<any> {
    console.log(`------------------- Loading events -----------------------`)
    const eventFiles = fs.readdirSync('dist/events').filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
        try {
            const eventName: string = file.split('.')[0]; // Get the exact name of the event from the eventFunction variable. If it's not given, the code just uses the name of the file as name of the event
            const event: IEvent = await require(`./events/${file}`)
            const newEvent: IEvent = createEvent(event as unknown as IEventConstructor)
            console.log(`Event: ${file}`)
            const emitter = client; // Here we define our emitter. This is in our case the client (the bot)
            try {
                emitter['on'](eventName, (...args: any) => newEvent.execute(...args)) // Run the event using the above defined emitter (client)
            } catch (error) {
                console.error(error.stack); // If there is an error, console log the error stack message
            }
        } catch (error) {
            console.error(`loadEvents: ${error}`)
        }
    }
    console.log(`----------------------------------------------------------`)
}

loadEvents()


client.login(process.env.token)
