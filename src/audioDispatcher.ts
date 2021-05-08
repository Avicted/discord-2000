import fs from 'fs'
import { StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js'
import { audioQueue } from './main'
import { Queue } from './queue'
import { AudioFileSource } from './enums/audioFileSource'
import ytdl from 'ytdl-core-discord'
import { IAudioQueueEntry } from './interfaces/audioQueueEntry'

export class AudioDispatcher {
    _audioQueue: Queue<IAudioQueueEntry> = audioQueue
    _playingAudio: boolean = false
    _main_volume: number = 0.7
    _youtube_volume: number = 0.4
    _dispatcher: StreamDispatcher | undefined = undefined

    public initialize() {
        console.log(`AudioDispatcher: loopAndCheckForQueueEntries started`)
        setInterval(() => {
            this.loopAndCheckForQueueEntries()
        }, 1000)
    }

    private loopAndCheckForQueueEntries(): void {
        if (!this._playingAudio && this._audioQueue.length() >= 1) {
            this.play()
        }
    }

    public pause(): void {
        if (this._dispatcher !== undefined) {
            this._dispatcher.pause()
        }
    }

    public resume(): void {
        if (this._dispatcher !== undefined) {
            this._dispatcher.resume()
        }
    }

    public skip(): void {
        this.nextAudioClip()
    }

    public async play(): Promise<void> {
        console.log(`AudioDispatcher: play()`)

        // Does the queue have any entries?
        if (this._audioQueue.length() < 1) {
            return
        }

        this._playingAudio = true

        // const fileName: string = this._audioQueue._store[0].keys().next().value
        const fileName: string = this._audioQueue._store[0].title
        const url: string = this._audioQueue._store[0].url ?? ''
        // const voiceChannel: VoiceChannel | undefined = this._audioQueue._store[0].get(fileName)
        const voiceChannel: VoiceChannel | undefined = this._audioQueue._store[0].voiceChannel

        if (voiceChannel === undefined) {
            console.error(`The VoiceChannel is undefined for the file name: ${fileName}`)
            return
        }

        const connection: VoiceConnection = await voiceChannel.join()

        let isAYoutubeSource: boolean = false
        if (url) {
            isAYoutubeSource = url.includes('youtube')
        }

        // Is the file a local audio file or a temporary text to speech audio file?
        // const isTTSFile: boolean = fileName.startsWith('tts_temp_audio')
        // const filePath: string = isTTSFile === true ? `${fileName}` : `media/${fileName}.ogg`
        let filePath: string

        let audioFileSource: AudioFileSource
        if (fileName.startsWith('tts_temp_audio')) {
            audioFileSource = AudioFileSource.TTS_FILE
            filePath = `${fileName}`
        } else if (!isAYoutubeSource) {
            audioFileSource = AudioFileSource.LOCAL_FILE
            filePath = `media/${fileName}.ogg`
        } else {
            audioFileSource = AudioFileSource.YOUTUBE
            filePath = url
        }

        switch (audioFileSource) {
            case AudioFileSource.TTS_FILE:
            case AudioFileSource.LOCAL_FILE:
                // Does the audio file exist?
                try {
                    if (fs.existsSync(`${filePath}`)) {
                        // file exists
                    } else {
                        console.log(`AudioDispatcher: The file ${fileName} does not exist`)
                    }
                } catch (err) {
                    console.error(err)
                    return
                }

                this._dispatcher = connection.play(fs.createReadStream(filePath), {
                    volume: this._main_volume,
                })
                break

            case AudioFileSource.YOUTUBE:
                this._dispatcher = connection.play(await ytdl(filePath), { type: 'opus', volume: this._youtube_volume })
                break
            default:
                console.error(
                    `[audioDispatcher -> play]: no match found in switch statement. input: ${audioFileSource}`
                )
                return
        }

        this._dispatcher.on('finish', (): void => {
            this.nextAudioClip(filePath)
            console.log(`Finished playing: ${fileName}`)
        })

        this._dispatcher.on('error', (error) => {
            console.error(`[audioDispatcher]`)
            console.error(error)
        })
    }

    private nextAudioClip(filePath?: string): void {
        // Remove the played file from the queue
        this._audioQueue.pop()

        if (filePath) {
            const isTTSFile: boolean = filePath.startsWith('tts_temp_audio')

            if (isTTSFile) {
                // remove the mp3 file
                try {
                    fs.unlinkSync(`${filePath}`)
                } catch (err) {
                    console.error(err)
                }
            }
        }

        if (this._audioQueue.length() < 1) {
            if (this._dispatcher !== undefined) {
                this._dispatcher.destroy() // end the stream
            }
            this._playingAudio = false
        } else {
            // There are more files in the queue, continue to play the next one
            this.play()
        }
    }
}
