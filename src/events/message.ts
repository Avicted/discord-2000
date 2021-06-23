import { Message } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { IEvent } from '../interfaces/event'
import { clientCommands } from '../main'
const prefix = process.env.CMD_PREFIX as string

module.exports = class MessageEvent implements IEvent {
    public async execute(message: Message): Promise<void> {
        if (message === undefined) return
        if (!message.content.startsWith(prefix)) return

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
        const userCommand: string | undefined = args.shift()?.toLowerCase()

        console.log(`The user: ${message.author.username} entered command: ${userCommand}`)

        // Is the command provided by the user a registered command?
        const selectedCommand = [...clientCommands.values()].filter((command: ICommand) => command.name === userCommand)
        if (selectedCommand.length < 1) return

        // @NOTE: @TODO: disabled due to Youtube updating their API and breaking ytdl: https://github.com/fent/node-ytdl-core/issues/945
        if (userCommand === 'p') {
            message.author.send('The command "p" command has been disabled due to youtube changing their API: https://github.com/fent/node-ytdl-core/issues/945');
            return
        }

        await selectedCommand[0].execute(message)
    }
}
