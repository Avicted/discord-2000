import { format, utcToZonedTime } from "date-fns-tz"
import { GuildMember, TextChannel, VoiceState } from "discord.js"
import { IEvent } from "../interfaces/event"
import { client } from "../main"

const enablePresenceUpdates: string | undefined = process.env.enable_presence_updates
const presenceTextChannel: string | undefined = process.env.presence_text_channel_updates
const timezone: string | undefined = process.env.timezone

module.exports = class VoiceStateUpdate implements IEvent {
    public async execute(oldState: VoiceState, newState: VoiceState) {
        if (enablePresenceUpdates === 'false') {
            return
        }
    
        const userId: string = oldState.id
        const oldChannelId: string | undefined = oldState.channel?.id
        const newChannelId: string | undefined = newState.channel?.id
        const oldChannelName: string | undefined = oldState.channel?.name
        const newChannelName: string | undefined = newState.channel?.name
    
    
        let textChannelMessage: string = ''
    
        // User that changed voice channel
        let user: GuildMember | undefined
        try {
            user = await oldState?.guild?.members.fetch(userId)
        } catch (error) {
            console.error(error)
            return
        }
    
        if (user === undefined) {
            console.error(`voiceStateUpdate: The user is undefined`)
            return
        }
    
        const username: string = user.nickname === null ? user.displayName : user.nickname
        if (timezone === undefined) {
            console.error(`voiceStateUpdate: The timezone is undefined`)
            return
        }
    
        // Timestamp converted to local time based on timezone e.g. 'Europe/Berlin'
        const timestamp: string = format(utcToZonedTime(new Date(), timezone), 'yyyy-MM-dd HH:mm:ss', { timeZone: timezone })
    
        // User has disconnected from a voice channel
        if (newChannelId === undefined) {
            textChannelMessage = `DEV ${username} has disconnected from ${oldChannelName} at ${timestamp}`
        }
        // User has joined a voice channel
        else if (oldChannelId === undefined && newChannelId !== undefined) {
            textChannelMessage = `DEV ${username} has joined ${newChannelName} at ${timestamp}`
        }
        // User has moved to a new voice channel
        else if (oldChannelId !== newChannelId) {
            textChannelMessage = `DEV ${username} moved to ${newChannelName} at ${timestamp}`
        }
    
        console.log(textChannelMessage)
    
        // Send a logging message to the presence_text_channel_updates
        if (textChannelMessage.length <= 0) {
            return
        }

        if (presenceTextChannel === undefined) {
            return
        }

        const textChannel: TextChannel | undefined = client.channels.cache.get(presenceTextChannel) as TextChannel

        if (textChannel === undefined) {
            return
        }

        textChannel.send(textChannelMessage);
    }
}