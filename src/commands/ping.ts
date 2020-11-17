import { Message } from "discord.js";
import { ICommand } from "../interfaces/command";

module.exports = class Ping implements ICommand {
    _name: string = 'ping'
    _description: string = 'Answers to a ping command'

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    public execute(message: Message) {
        message.channel.send('Pong.')    
    }
}