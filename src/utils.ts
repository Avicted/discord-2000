import fs from 'fs'
import { utcToZonedTime } from "date-fns-tz"
import { createCommand, ICommand, ICommandConstructor } from "./interfaces/command"
import { client, clientCommands } from "./main"
import { createEvent, IEvent, IEventConstructor } from './interfaces/event'


export function checkTimezoneSettings(): void {
    const enablePresenceUpdates: string | undefined = process.env.enable_presence_updates
    const presenceTextChannel: string | undefined = process.env.presence_text_channel_updates
    const timezone: string | undefined = process.env.timezone

    // Check if the date-fns timezone has been set correctly
    if (enablePresenceUpdates === 'true') {
        if (presenceTextChannel === undefined) {
            console.error(`presenceTextChannel is undefined in .env while enablePresenceUpdates was true`)
            process.exit(1)
        }
        if (timezone === undefined) {
            console.error(`timezone is undefined while enablePresenceUpdates was true`)
            process.exit(1)
        }

        try {
            const zonedDate: Date = utcToZonedTime(new Date(), timezone)
        } catch (error) {
            console.error(`Invalid timezone set in .env: ${error}`)
            process.exit(1)
        }
    }
}


export async function loadCommandFiles(): Promise<any> {
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


export async function loadEvents(): Promise<any> {
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
                emitter['on'](eventName, async (...args: any) => await (async () => { newEvent.execute(...args) })()) // Run the event using the above defined emitter (client)
            } catch (error) {
                console.error(error.stack); // If there is an error, console log the error stack message
            }
        } catch (error) {
            console.error(`loadEvents: ${error}`)
        }
    }
    console.log(`----------------------------------------------------------`)
}
