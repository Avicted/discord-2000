import { Message, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { DbContext } from '../persistence/dbContext'

module.exports = class Stats implements ICommand {
    _name: string = 'stats'
    _description: string = 'Replies with the users Discord server statistics'

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

        // Fetch the users statistics
        const dbContext: DbContext = new DbContext()
        const userStatistics: string | undefined = await dbContext.userOnlineTimeInServerTotal(message.member)

        // Answer the user in a direct message
        const embedMessage: MessageEmbed = new MessageEmbed()

        if (userStatistics === undefined) {
            embedMessage
                .setColor('#ff0000')
                .setTitle(`An error occurred`)
                .setDescription(`Could not calculate your total online time for this Discord server.`)

            message.author.send(embedMessage)
        } else {
            embedMessage
                .setColor('#ff00ff')
                .setTitle(`Total time active in the server`)
                .setDescription(`${userStatistics}`)
        }

        message.author.send(embedMessage)
    }
}
