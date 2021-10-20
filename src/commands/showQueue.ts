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
        const audioFileNameColumns: { fileName: string; image?: string }[] = []
        let nowPlaying: { fileName: string; image?: string } | undefined = undefined

        if (this._audioQueue.length() <= 0) {
            message.channel.send('The queue is empty')
            return
        }

        for (let i: number = 0; i < this._audioQueue.length(); i++) {
            const audioFileName = this._audioQueue._store[i].title
            const image: string | undefined = this._audioQueue._store[i].image

            if (i === 0) {
                nowPlaying = { fileName: audioFileName, image: image }
            } else {
                audioFileNameColumns.push({ fileName: audioFileName, image: image })
            }
        }

        embedMessage.addField(`Now playing:`, nowPlaying?.fileName.toString() || 'We have no idea what is currently playing', false)

        if (nowPlaying?.image) {
            embedMessage.setThumbnail(nowPlaying?.image)
        }

        if (audioFileNameColumns.length === 0) {
        } else if (audioFileNameColumns.length > 10) {
            const files = audioFileNameColumns.slice(0, 9)
            embedMessage.addField('Upcomming:', files.map((file) => file.fileName).concat('\n').toString())
        } else {
            embedMessage.addField('Upcomming:', '\u200B')

            audioFileNameColumns.map((file) => {
                embedMessage.addField(file.fileName, '\u200B')
            })
        }

        message.channel.send({ embeds: [embedMessage] })
    }
}
