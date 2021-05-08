import { Message, MessageEmbed, VoiceChannel } from 'discord.js'
import { IAudioQueueEntry } from '../interfaces/audioQueueEntry'
import { ICommand } from '../interfaces/command'
import { audioQueue } from '../main'
import { Queue } from '../queue'

module.exports = class ShowQueue implements ICommand {
    _name: string = 'q'
    _description: string = 'Displays the audio queue'
    _audioQueue: Queue<IAudioQueueEntry> = audioQueue

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        const embedMessage: MessageEmbed = new MessageEmbed().setColor('#ff00ff').setTitle(`Audio queue`)
        const audioFileNameColumns: string[] = []
        let nowPlaying: string = ''

        if (this._audioQueue.length() <= 0) {
            message.channel.send('The queue is empty')
            return
        }

        for (let i: number = 0; i < this._audioQueue.length(); i++) {
            const audioFileName = this._audioQueue._store[i].title

            if (i === 0) {
                nowPlaying = audioFileName
            } else {
                audioFileNameColumns.push(audioFileName)
            }
        }

        embedMessage.addField(`Now playing:`, nowPlaying, false)

        if (audioFileNameColumns.length === 0) {
        } else if (audioFileNameColumns.length > 10) {
            const files = audioFileNameColumns.slice(0, 9)
            embedMessage.addField('Upcomming:', files.concat('\n'))
        } else {
            embedMessage.addField('Upcomming:', audioFileNameColumns.concat('\n'))
        }

        message.channel.send(embedMessage)
    }
}
