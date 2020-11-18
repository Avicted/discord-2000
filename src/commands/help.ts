import { Message } from "discord.js";
import { ICommand } from "../interfaces/command";
import { clientCommands } from "../main";
import fs from 'fs'

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

        // List all local audio files
        fs.readdir('./media/', (err: any, files: string[]) => {
            info += `\n**Audio commands**\n`;

            files.forEach(file => {
                const fileName: string = file.substr(0, file.length - 4);
                info += `:white_small_square: ${fileName}\n`;
            });

            message.channel.send(info);
        });
    }
}
