import fs from 'fs'
import { Message, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import { ICommand } from "../interfaces/command"
const prefix = process.env.cmdPrefix as string
const ffmpeg = require('fluent-ffmpeg')
import text2wav = require('text2wav')
import { Queue } from '../queue';
import { audioQueue } from '../main';

// @TODO: TTS does not work in the production environment
// Cannot process audio: ffmpeg exited with code 1: 1605811069971_tts_temp_audio/tts_temp.mp3: No such file or directory

module.exports = class TTS implements ICommand {
    _name: string = 'tts'
    _description: string = 'Uses espeak to generate audio'
    _audioQueue: Queue<Map<string, VoiceChannel>> = audioQueue
    _ttsOutputWavFile: string = 'tts_temp_audio/tts_temp_raw'
    _ttsOutputMP3File: string = 'tts_temp_audio/tts_temp'

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    public async execute(message: Message) {
        let args: string[] = message.content.slice(prefix.length).trim().split(/ +/)
        console.log({
            args
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

        const rawAudioData = await text2wav(`${text}`, {
            // voice: 'en+whisper',
            punct: '"',
            speed: 60,
            pitch: 80,
            voice: 'fi',
        })

        fs.writeFileSync(`${this._ttsOutputWavFile}_${message.createdTimestamp}.wav`, rawAudioData)

        console.log(`rawAudioData length: ${rawAudioData.length}`)

        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;

        if (message.member?.voice.channel) {
            const voiceChannel: VoiceChannel = message.member.voice.channel
            await this.convertWavBytesToOpus(rawAudioData, message.createdTimestamp)

            const queueEntry: Map<string, VoiceChannel> = new Map()
            this._audioQueue.push(queueEntry.set(`${this._ttsOutputMP3File}_${message.createdTimestamp}.mp3`, voiceChannel))
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }

    private async convertWavBytesToOpus(rawAudioData: Uint8Array, messageCreatedTimeStamp: number): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            ffmpeg()
                .input(`${this._ttsOutputWavFile}_${messageCreatedTimeStamp}.wav`)
                // @Note: reverb test
                // .input(`tts_temp_audio/five_colums.wav`)
                // '[0] [1] afir=dry=10:wet=10'
                /* .complexFilter([
                    {
                        filter: "afir=dry=10:wet=4",
                        // options: { dry: 10, wet: 10 },
                        // inputs: "0:1",
                        outputs: "output",
                    },
                ], 'output') */
                .noVideo()
                .audioFrequency(48000)
                .audioChannels(2)
                .audioCodec('libmp3lame')
                .format('s16le')
                .on('error', (err: any, stdout: any, stderr: any) => {
                    console.error('Cannot process audio: ' + err.message);
                    rejects(false)
                })
                .on('end', () => {
                    console.log('1. Processing ogg ffmpeg finished!');

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