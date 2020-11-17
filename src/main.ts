import fs from 'fs'
import { Message } from 'discord.js'
import { createCommand, ICommand, ICommandConstructor } from './interfaces/command'
const Discord = require('discord.js')

const client = new Discord.Client()
const prefix = process.env.cmdPrefix as string
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('dist/commands').filter(file => file.endsWith('.js'))

async function loadCommandFiles(): Promise<any> {
    console.log('loadCommandFiles...')
    console.log(commandFiles.length)

    for (const file of commandFiles) {
        try {
            const command: ICommand = await require(`./commands/${file}`)
            const newCommand = createCommand(command as unknown as ICommandConstructor, command.name, command.description)
            client.commands.set(newCommand.name, newCommand)
        } catch (error) {
            console.error(error)
        }
    }
}

loadCommandFiles()


client.on('ready', () => {
    console.log(`Logged in as ${client?.user?.tag}! cmdPrefix: ${prefix}`)
    console.log(client.commands)
})

client.on('message', (message: Message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
    const command: string | undefined = args.shift()?.toLowerCase()
})

client.login(process.env.token)
