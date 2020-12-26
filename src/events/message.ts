import { Message } from "discord.js";
import { ICommand } from "../interfaces/command";
import { IEvent } from "../interfaces/event";
import { clientCommands } from "../main";
const prefix = process.env.cmdPrefix as string


module.exports = class MessageEvent implements IEvent {
    public execute(message: Message) {
        if (message === undefined) return 
        if (!message.content.startsWith(prefix) || message.author.bot) return

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
        const userCommand: string | undefined = args.shift()?.toLowerCase()

        console.log(`The user: ${message.author.username} entered command: ${userCommand}`)

        // Is the command provided by the user a registered command?
        const selectedCommand = [...clientCommands.values()].filter((command: ICommand) => command.name === userCommand)
        if (selectedCommand.length < 1) return;

        selectedCommand[0].execute(message)
    }
}