import { Message } from "discord.js";

// All commands need to adhere to this basic interface
export interface ICommand {
    name: string;
    description: string;

    execute: (message: Message) => any;
}

export interface ICommandConstructor {
    new (name: string, description: string): ICommand;
}

export function createCommand(ctor: ICommandConstructor, name: string, description: string): ICommand {
    return new ctor(name, description);
}