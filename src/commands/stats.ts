import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import { DbContext } from '../persistence/dbContext'
import fs from 'fs'

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

        // Fetch a chart (image) of the users online hours per day this year
        const pythonDataPayload: any = [{ user_id: message.author.id }]

        const runPy = new Promise((resolve, reject) => {
            const { spawn } = require('child_process')
            let scriptOutput: string = ''
            let errorOutput: string = ''

            const childProcess = spawn('python3', [
                './src/spawnable_processes/user_online_time.py',
                JSON.stringify(pythonDataPayload),
            ])
            childProcess.stdout.setEncoding('utf8')
            childProcess.stdout.on('data', (data: any) => {
                console.log('stdout: ' + data)
                data = data.toString()
                scriptOutput += data
            })

            childProcess.stderr.setEncoding('utf8')
            childProcess.stderr.on('data', (data: any) => {
                console.log('stderr: ' + data)
                data = data.toString()
                errorOutput += data
            })

            childProcess.on('close', (code: any) => {
                console.log(`closing code: ${code}`)
                console.log(`Full output of script: ${scriptOutput}`)

                if (code === 0) {
                    resolve(scriptOutput)
                } else {
                    reject(errorOutput)
                }
            })
        })

        await runPy
            .then((data: any) => {
                data = data.trim()
                const imagePath: string = `${process.env.PWD}/${data}`
                const attachment = new MessageAttachment(imagePath, `${data}`)
                const embedMessage: MessageEmbed = new MessageEmbed()

                if (userStatistics === undefined) {
                    embedMessage
                        .setColor('#ff0000')
                        .setTitle(`An error occurred`)
                        .setDescription(`Could not calculate your total online time for this Discord server.`)
                } else {
                    embedMessage
                        .setColor('#ff00ff')
                        .setTitle(`Total time active in the server`)
                        .setDescription(`${userStatistics}`)
                        .attachFiles([attachment])
                        .setImage(`attachment://${data}`)
                }

                message.author.send(embedMessage).then(() => {
                    // Delete the image from the project root
                    try {
                        fs.unlinkSync(imagePath)
                    } catch (err) {
                        console.error(err)
                    }
                })
            })
            .catch((error) => {
                console.error(error)
                message.channel.send(`Node: Could not fetch any online data.`)
            })
    }
}
