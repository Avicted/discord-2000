import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import fs from 'fs'

module.exports = class Online implements ICommand {
    _name: string = 'online'
    _description: string = `Chart with total online hours this year for all users.`

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        const runPy = new Promise((resolve, reject) => {
            const { spawn } = require('child_process')
            let scriptOutput: string = ''
            let errorOutput: string = ''

            const childProcess = spawn('python3', ['./src/spawnable_processes/user_online_time.py'])
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
                const messageText: string = `Total hours online per day (all users) this year`

                message.channel.send(messageText, attachment).then(() => {
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
