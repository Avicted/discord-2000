import fs from 'fs'
import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import { audioQueue } from "./main";
import { Queue } from "./queue";

export class AudioDispatcher {
    _audioQueue: Queue<Map<string, VoiceChannel>> = audioQueue
    _playingAudio: boolean = false

    public initialize() {
        console.log(`AudioDispatcher: loopAndCheckForQueueEntries started`)
        setInterval(() => {
            this.loopAndCheckForQueueEntries()
        }, 1000);
    }

    private loopAndCheckForQueueEntries(): void {
        if (!this.isPlayingAudio && this._audioQueue.length() >= 1) {
            this.play()
        }
    }

    public get isPlayingAudio(): boolean {
        return this._playingAudio
    }

    public async play(): Promise<void> {
        console.log(`AudioDispatcher: play()`)

        // Does the queue have any entries?
        if (this._audioQueue.length() < 1) {
            return
        }

        this._playingAudio = true

        console.log(this._audioQueue._store[0])
        const fileName: string = this._audioQueue._store[0].keys().next().value
        const voiceChannel: VoiceChannel | undefined = this._audioQueue._store[0].get(fileName)

        if (voiceChannel === undefined) {
            console.error(`The VoiceChannel is undefined for the file name: ${fileName}`)
            return
        }

        const connection: VoiceConnection = await voiceChannel.join()

        // Is the file a local audio file or a temporary text to speech audio file?
        const isTTSFile: boolean = fileName.startsWith('tts_temp_audio')
        const filePath: string = isTTSFile === true ? `${fileName}` : `media/${fileName}.ogg`

        const dispatcher: StreamDispatcher = connection.play(fs.createReadStream(filePath), {
            volume: 0.7,
        })

        dispatcher.on('finish', (): void => {
            // Remove the played file from the queue
            this._audioQueue.pop()

            if (isTTSFile) {
                // remove the mp3 file
                try {
                    fs.unlinkSync(`${filePath}`)
                } catch (err) {
                    console.error(err)
                }
            }

            if (this._audioQueue.length() < 1) {
                dispatcher.destroy() // end the stream
                this._playingAudio = false
            } else {
                // There are more files in the queue, continue to play the next one
                this.play()
            }

            console.log(`Finished playing: ${fileName}`)
        })
    }
}
