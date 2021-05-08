import { Message, VoiceChannel } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { audioQueue } from '../main'
import { Queue } from '../queue'

module.exports = class ClearQueue implements ICommand {
    _name: string = 'clear'
    _description: string = 'Clears the audio queue'
    _audioQueue: Queue<Map<string, VoiceChannel>> = audioQueue

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        this._audioQueue.clear()
        message.channel.send('Audio queue cleared')
    }
}
