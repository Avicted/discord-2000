import fs from 'fs'
import { Message, StageChannel, VoiceChannel } from 'discord.js'
import { ICommand } from '../interfaces/command'
const prefix = process.env.CMD_PREFIX as string
const ffmpeg = require('fluent-ffmpeg')
import text2wav = require('text2wav')
import { Queue } from '../queue'
import { audioQueue } from '../main'
import { IAudioQueueEntry } from '../interfaces/audioQueueEntry'

module.exports = class TTS implements ICommand {
    _name: string = 'tts'
    _description: string = 'Uses espeak to generate audio'
    _audioQueue: Queue<IAudioQueueEntry> = audioQueue
    _ttsOutputWavFile: string = 'tts_temp_audio/tts_temp_raw'
    _ttsOutputMP3File: string = 'tts_temp_audio/tts_temp'

    get name(): string {
        return this._name
    }

    get description(): string {
        return this._description
    }

    public async execute(message: Message): Promise<void> {
        let args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
        console.log({
            args,
        })

        if (args.length > 1) {
            args.shift()
        } else if (args.length === 1) {
            args = ['Please provide text to the text to speech command']
        }

        const text: string = args.join(' ')
        console.log({
            info: 'TTS execute',
            text,
        })

        const rawAudioData: Uint8Array | undefined = await (async () => {
            try {
                return text2wav(`${text.replace('-', ' ')}`, {
                    punct: '"',
                    speed: 70,
                    pitch: 99,
                    voice: 'fi+iven2',
                })
            } catch (error) {
                return
            }
        })()

        if (rawAudioData === undefined) {
            console.error(`rawAudioData was undefined`)
            return
        }

        fs.writeFileSync(`${this._ttsOutputWavFile}_${message.createdTimestamp}.wav`, rawAudioData)

        console.log(`rawAudioData length: ${rawAudioData.length}`)

        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return

        if (message.member?.voice.channel) {
            const voiceChannel: VoiceChannel | StageChannel = message.member.voice.channel
            await this.convertWavBytesToOpus(rawAudioData, message.createdTimestamp)

            const queueEntry: IAudioQueueEntry = {
                title: `${this._ttsOutputMP3File}_${message.createdTimestamp}.mp3`,
                voiceChannel: voiceChannel,
            }
            this._audioQueue.push(queueEntry)
        } else {
            message.reply('You need to join a voice channel first!')
        }
    }

    private async convertWavBytesToOpus(rawAudioData: Uint8Array, messageCreatedTimeStamp: number): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            ffmpeg()
                .input(`${this._ttsOutputWavFile}_${messageCreatedTimeStamp}.wav`)
                // @Note: reverb test
                // .input(`tts_temp_audio/five_colums.wav`) // requires a impulse response audio file
                // '[0] [1] afir=dry=10:wet=10'
                /* .complexFilter([
                    {
                        filter: "afir=dry=10:wet=1",
                        // options: {  },
                        // inputs: "0:1",
                        outputs: "output",
                    },
                ], 'output') */
                .complexFilter(
                    [
                        {
                            filter: 'volume=-5dB',
                            outputs: 'output',
                        },
                    ],
                    'output'
                )
                .noVideo()
                .audioFrequency(48000)
                .audioChannels(2)
                .audioCodec('libmp3lame')
                .format('s16le')
                .on('error', (err: any, stdout: any, stderr: any) => {
                    console.error('Cannot process audio: ' + err.message)
                    rejects(false)
                })
                .on('end', () => {
                    console.log('1. Processing ogg ffmpeg finished!')

                    // remove the wav file generated by tts
                    try {
                        fs.unlinkSync(`${this._ttsOutputWavFile}_${messageCreatedTimeStamp}.wav`)
                    } catch (err) {
                        console.error(err)
                    }

                    resolve(true)
                })
                .save(`${this._ttsOutputMP3File}_${messageCreatedTimeStamp}.mp3`)
        })
    }
}
