import fs from 'fs'
import { GuildMember, Message, VoiceChannel, VoiceState } from 'discord.js'
import { createCommand, ICommand, ICommandConstructor } from './interfaces/command'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
import { format, utcToZonedTime } from 'date-fns-tz'
const Discord = require('discord.js')
const client = new Discord.Client()
const prefix = process.env.cmdPrefix as string
export const clientCommands = new Discord.Collection()

// Global queue for storing audio sources
export const audioQueue: Queue<Map<string, VoiceChannel>> = new Queue()

// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

// Should the bot post user presence updates to a predefined text channel?
const enablePresenceUpdates: string | undefined = process.env.enable_presence_updates
const presenceTextChannel: string | undefined = process.env.presence_text_channel_updates
const timezone: string | undefined = process.env.timezone


const commandFiles = fs.readdirSync('dist/commands').filter(file => file.endsWith('.js'))

async function loadCommandFiles(): Promise<any> {
    for (const file of commandFiles) {
        try {
            const command: ICommand = await require(`./commands/${file}`)
            const newCommand = createCommand(command as unknown as ICommandConstructor, command.name, command.description)
            clientCommands.set(newCommand.name, newCommand)
        } catch (error) {
            console.error(error)
        }
    }
}

loadCommandFiles()


client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}! cmdPrefix: ${prefix}`)
    console.log(`------------------------ Commands ------------------------`)
    console.log(clientCommands)
    console.log(`----------------------------------------------------------`)
})

client.on('message', (message: Message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
    const userCommand: string | undefined = args.shift()?.toLowerCase()

    console.log(`The user: ${message.author.username} entered command: ${userCommand}`)

    // Is the command provided by the user a registered command?
    const selectedCommand = [...clientCommands.values()].filter((command: ICommand) => command.name === userCommand)
    if (selectedCommand.length < 1) return;

    selectedCommand[0].execute(message)
})

// Presence updates, send a message to a specific text channel when a user connects or disconnects to or from a voice channel
client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
    if (enablePresenceUpdates === 'false') {
        return
    }

    const userId: string = oldState.id
    const oldChannelId: string | undefined = oldState.channel?.id
    const newChannelId: string | undefined = newState.channel?.id
    const oldChannelName: string | undefined = oldState.channel?.name
    const newChannelName: string | undefined = newState.channel?.name


    let textChannelMessage: string = ''

    // User that changed voice channel
    let user: GuildMember | undefined
    try {
        user = await oldState?.guild?.members.fetch(userId)
    } catch (error) {
        console.error(error)
        return
    }

    if (user === undefined) {
        console.error(`voiceStateUpdate: The user is undefined`)
        return
    }

    const username: string = user.nickname === null ? user.displayName : user.nickname
    if (timezone === undefined) {
        console.error(`voiceStateUpdate: The timezone is undefined`)
        return
    }

    // Timestamp converted to local time based on timezone e.g. 'Europe/Berlin'
    const timestamp: string = format(utcToZonedTime(new Date(), timezone), 'yyyy-MM-dd HH:mm:ss', { timeZone: timezone })

    // User has disconnected from a voice channel
    if (newChannelId === undefined) {
        textChannelMessage = `${username} has disconnected from ${oldChannelName} at ${timestamp}`
    }
    // User has joined a voice channel
    else if (oldChannelId === undefined && newChannelId !== undefined) {
        textChannelMessage = `${username} has joined ${newChannelName} at ${timestamp}`
    }
    // User has moved to a new voice channel
    else if (oldChannelId !== newChannelId) {
        textChannelMessage = `${username} moved to ${newChannelName} at ${timestamp}`
    }

    console.log(textChannelMessage)

    // Send a logging message to the presence_text_channel_updates
    if (textChannelMessage.length <= 0) {
        return
    }

    client.channels.cache.get(presenceTextChannel).send(textChannelMessage);
})


client.login(process.env.token)
