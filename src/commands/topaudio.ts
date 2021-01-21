import { Message, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { ITopAudioCommand } from '../interfaces/topAudioCommands'
import { DbContext } from '../persistence/dbContext'

module.exports = class TopAudio implements ICommand {
    _name: string = 'topaudio'
    _description: string = 'Replies with the top 10 most played audio commands'

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        if (message.member === null) {
            return
        }

        const dbContext: DbContext = new DbContext()
        const topAudioCommands: ITopAudioCommand[] = await dbContext.topTenAudioCommands()
        const embedMessage: MessageEmbed = new MessageEmbed()

        if (topAudioCommands.length <= 0) {
            embedMessage
                .setColor('#ff0000')
                .setTitle(`An error occurred`)
                .setDescription(
                    `Could not fetch the top ten audio commands, since no audio commands have been played yet.`
                )
        } else {
            const commands: string[] = topAudioCommands.map((command: ITopAudioCommand) => command.command)
            const counts: number[] = topAudioCommands.map((command: ITopAudioCommand) => parseInt(command.count))

            embedMessage
                .setColor('#ff00ff')
                .setTitle(`Top 10 audio commands (all time)`)
                .addField(`Audio commands`, commands.join('\n'), true)
                .addField(`Play count`, counts.join('\n'), true)
        }

        message.channel.send(embedMessage)
    }
}
