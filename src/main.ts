import fs from 'fs'
import { Message, VoiceChannel } from 'discord.js'
import { createCommand, ICommand, ICommandConstructor } from './interfaces/command'
import { Queue } from './queue'
import { AudioDispatcher } from './audioDispatcher'
const Discord = require('discord.js')

const client = new Discord.Client()
const prefix = process.env.cmdPrefix as string
export const clientCommands = new Discord.Collection()
// Global queue for storing audio sources
export const audioQueue: Queue<Map<string, VoiceChannel>> = new Queue()
// Global audio dispatcher for playing audio from the audioQueue
export const audioDispatcher: AudioDispatcher = new AudioDispatcher()
audioDispatcher.initialize()

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

client.login(process.env.token)
