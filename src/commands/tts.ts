import fs from 'fs'
import { Message, StreamDispatcher, VoiceConnection } from "discord.js";
import { ICommand } from "../interfaces/command"
const prefix = process.env.cmdPrefix as string
const ffmpeg = require('fluent-ffmpeg')
import text2wav = require('text2wav')
import { Queue } from '../queue';
import { audioQueue } from '../main';

module.exports = class TTS implements ICommand {
    _name: string = 'tts'
    _description: string = 'Uses espeak to generate audio'
    _audioQueue: Queue<string> = audioQueue
    _ttsOutputWavFile: string = 'tts_temp_audio/tts_temp_raw.wav'
    _ttsOutputMP3File: string = 'tts_temp_audio/tts_temp.mp3'

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
            speed: 30,
            pitch: 50,
            voice: 'fi',
        })

        fs.writeFileSync(`${this._ttsOutputWavFile}_${message.createdTimestamp}`, rawAudioData)

        console.log(`rawAudioData length: ${rawAudioData.length}`)

        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;

        if (message.member?.voice.channel) {
            const connection: VoiceConnection = await message.member.voice.channel.join();

            await this.convertWavBytesToOpus(rawAudioData, message.createdTimestamp)
            this._audioQueue.push(`${this._ttsOutputMP3File}_${message.createdTimestamp}`)

            console.log(`this._audioQueue`)
            console.log({
                _audioQueue: this._audioQueue,
                length: this._audioQueue.length(),
            })

            if (this._audioQueue.length() <= 1) {
                this.playTTSFile(connection, message.createdTimestamp)
            }
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }

    private async convertWavBytesToOpus(rawAudioData: Uint8Array, messageCreatedTimeStamp: number): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            ffmpeg(`${this._ttsOutputWavFile}_${messageCreatedTimeStamp}`)
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
                        fs.unlinkSync(`${this._ttsOutputWavFile}_${messageCreatedTimeStamp}`)
                    } catch (err) {
                        console.error(err)
                    }

                    resolve(true)
                })
                .save(`${this._ttsOutputMP3File}_${messageCreatedTimeStamp}`)
        })
    }

    private playTTSFile(connection: VoiceConnection, messageCreatedTimeStamp: number): void {
        console.log('playTTSFile')

        const dispatcher: StreamDispatcher = connection.play(fs.createReadStream(`${this._ttsOutputMP3File}_${messageCreatedTimeStamp}`), {
            volume: 0.9,
        })

        dispatcher.on('finish', (): void => {
            // remove the mp3 file
            try {
                fs.unlinkSync(`${this._ttsOutputMP3File}_${messageCreatedTimeStamp}`,)
            } catch (err) {
                console.error(err)
            }

            this._audioQueue.pop()
            if (this._audioQueue.length() < 1) {
                dispatcher.destroy() // end the stream
            }
        })
    }
}