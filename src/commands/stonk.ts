import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { ICommand } from '../interfaces/command'
import fs from 'fs'
const prefix = process.env.CMD_PREFIX as string

module.exports = class Stonk implements ICommand {
    _name: string = 'stonk'
    _description: string = `Provides stock data for a given ticker, eg. ${prefix}stonk aapl`

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/)

        if (args.length < 2) {
            message.reply(`Please enter a stock ticker: ${prefix}stonk aapl`)
            return
        }

        const tickerSymbol: string = args[1].toLowerCase()

        const runPy = new Promise((resolve, reject) => {
            const { spawn } = require('child_process')
            const pythonDataPayload: any = [{ stock_ticker_symbol: tickerSymbol }]

            let scriptOutput: string = ''
            let errorOutput: string = ''

            const childProcess = spawn('python3', [
                './src/spawnable_processes/stonks.py',
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

                message.channel
                    .send({ content: `${tickerSymbol.toUpperCase()}`, attachments: [attachment] })
                    .then(() => {
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
                message.channel.send(`Node: Could not fetch any stock data for the ticker ${tickerSymbol}`)
            })
    }
}
