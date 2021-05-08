import { Message } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { audioDispatcher } from '../main'

module.exports = class ResumeAudio implements ICommand {
    _name: string = 'resume'
    _description: string = 'Resumes audio playback'

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        audioDispatcher.resume()
        message.channel.send('Playback resumed')
    }
}
