import { Message } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { audioDispatcher } from '../main'

module.exports = class SkipAudio implements ICommand {
    _name: string = 'skip'
    _description: string = 'Skips to the next audio in queue'

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        audioDispatcher.skip()
        message.channel.send('Queue entry skipped')
    }
}
