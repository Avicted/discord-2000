import { Message } from "discord.js";
import { ICommand } from "../interfaces/command";
import { clientCommands } from "../main";

module.exports = class Help implements ICommand {
    _name: string = 'help'
    _description: string = 'Display all bot commands'
    _clientCommands: any = clientCommands

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    public execute(message: Message) {
        let info = "**COMMAND LIST**\n\n"

        this._clientCommands.forEach((command: ICommand) => {
            info += `:white_small_square: ${command.name} -  ${command.description}\n`
        });

        message.channel.send(info);
    }
}
