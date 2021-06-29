import { Message, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { clientCommands } from '../main'
const prefix = process.env.CMD_PREFIX as string
import fs from 'fs'

module.exports = class Help implements ICommand {
    _name: string = 'help'
    _description: string = 'Display all bot commands'
    _clientCommands: any = clientCommands

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        const embedMessage: MessageEmbed = new MessageEmbed().setColor('#ff00ff').setTitle(`Bop bop`)

        const commandNames: string[] = []

        this._clientCommands.forEach((command: ICommand) => {
            if (command.name === 'help') {
                return
            }

            commandNames.push(`${prefix}${command.name} - ${command.description}`)
        })

        embedMessage.addField(`Commands`, commandNames.join('\n'))

        // List all local audio files
        fs.readdir('./media/', (err: any, files: string[]) => {
            if (err) {
                console.error(`Command Help: execute readdir`)
                console.error(err)
                return
            }

            // Sort by created time
            files = files
                .map((fileName) => {
                    return {
                        name: fileName,
                        time: fs.statSync(`./media/${fileName}`).mtime.getTime(),
                    }
                })
                .sort((a, b) => {
                    return b.time - a.time
                })
                .map((v) => {
                    return v.name
                })

            const audioFileNames: string[] = []

            files.forEach((file) => {
                const fileExtension: string = file.split('.')[1]
                if (fileExtension !== 'ogg') {
                    console.warn(`The file ${file} is not an .ogg audio file.`)
                    return
                }

                const fileName: string = file.substr(0, file.length - 4)
                audioFileNames.push(fileName)
            })

            if (audioFileNames.length <= 0) {
                message.channel.send(embedMessage)
                return
            }

            if (audioFileNames.length >= 10) {
                const slice = audioFileNames.slice(0, Math.ceil(audioFileNames.length / 10))

                for (const fileName in slice) {
                    audioFileNames[fileName] = `***${audioFileNames[fileName]}***`
                }
            }

            embedMessage.addField('\u200B', '\u200B')

            // Divide the audio commands into three columns
            const audioFileNameColumns: string[][] = []
            const columnSize: number = audioFileNames.length / 3

            for (let i = 0; i < 3; i++) {
                const group: string[] = audioFileNames.slice(i * columnSize, (1 + i) * columnSize)
                audioFileNameColumns.push(group)
            }

            embedMessage.addField(`Audio commands`, audioFileNameColumns[0] ?? '\u200B', true)
            embedMessage.addField(`\u200B`, audioFileNameColumns[1] ?? '\u200B', true)
            embedMessage.addField(`\u200B`, audioFileNameColumns[2] ?? '\u200B', true)

            message.channel.send(embedMessage)
        })
    }
}
