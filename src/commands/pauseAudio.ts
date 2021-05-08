import { Message } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { audioDispatcher } from '../main'

module.exports = class PauseAudio implements ICommand {
    _name: string = 'pause'
    _description: string = 'Pauses audio playback'

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        audioDispatcher.pause()
        message.channel.send('Playback paused')
    }
}
