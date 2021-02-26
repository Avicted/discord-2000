import { format, utcToZonedTime } from 'date-fns-tz'
import { GuildMember, MessageEmbed, TextChannel, VoiceState } from 'discord.js'
import { User as DiscordUser } from 'discord.js'
import { getConnection } from 'typeorm'
import { User } from '../persistence/entity/User'
import { UserPresenceAction } from '../enums/userPresenceAction'
import { IEvent } from '../interfaces/event'
import { client } from '../main'
import { DbContext } from '../persistence/dbContext'

const enablePresenceUpdates: string | undefined = process.env.ENABLE_PRESENCE_UPDATES
const presenceTextChannel: string | undefined = process.env.PRESENCE_TEXT_CHANNEL_UPDATES
const timezone: string | undefined = process.env.timezone

module.exports = class VoiceStateUpdate implements IEvent {
    public async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        if (enablePresenceUpdates === 'false') {
            return
        }

        const userId: string = oldState.id
        const oldChannelId: string | undefined = oldState.channel?.id
        const newChannelId: string | undefined = newState.channel?.id
        const oldChannelName: string | undefined = oldState.channel?.name
        const newChannelName: string | undefined = newState.channel?.name
        const dbContext: DbContext = new DbContext()

        // guildMember that changed voice channel
        let guildMember: GuildMember | undefined
        let discordUser: DiscordUser | undefined
        try {
            guildMember = await oldState?.guild?.members.fetch(userId)
            discordUser = await client.users.fetch(userId)
        } catch (error) {
            console.error(error)
            return
        }

        if (guildMember === undefined) {
            console.error(`voiceStateUpdate: The guildMember is undefined`)
            return
        }

        const username: string = guildMember.nickname === null ? guildMember.displayName : guildMember.nickname
        if (timezone === undefined) {
            console.error(`voiceStateUpdate: The timezone is undefined`)
            return
        }

        // Timestamp converted to local time based on timezone e.g. 'Europe/Berlin'
        const timestamp: string = `Time: ${format(utcToZonedTime(new Date(), timezone), 'yyyy-MM-dd HH:mm:ss', {
            timeZone: timezone,
        })}`
        let userAction: string = ''

        // User has disconnected from a voice channel
        if (newChannelId === undefined) {
            userAction = `has disconnected from ${oldChannelName}`

            let userInDatabase: User | undefined = await dbContext.getUser(guildMember)

            if (!userInDatabase) {
                await dbContext.createNewUser(guildMember, discordUser.bot)
                userInDatabase = await dbContext.getUser(guildMember)

                if (userInDatabase) {
                    await dbContext.addNewUserPresence(userInDatabase, UserPresenceAction.DISCONNECTED)
                }
            } else {
                await dbContext.addNewUserPresence(userInDatabase, UserPresenceAction.DISCONNECTED)
            }
        }
        // User has joined a voice channel
        else if (oldChannelId === undefined && newChannelId !== undefined) {
            userAction = `has joined ${newChannelName}`

            // Is the user already stored in the database?
            let userInDatabase: User | undefined = await dbContext.getUser(guildMember)

            if (userInDatabase) {
                // Update the users nickname and updatedAt
                await getConnection()
                    .createQueryBuilder()
                    .update(User)
                    .set({
                        nickname: guildMember.nickname !== null ? guildMember.nickname : undefined,
                    })
                    .where('id = :id', { id: guildMember.id })
                    .execute()
            } else {
                await dbContext.createNewUser(guildMember, discordUser.bot)
                userInDatabase = await dbContext.getUser(guildMember)
            }

            if (userInDatabase) {
                await dbContext.addNewUserPresence(userInDatabase, UserPresenceAction.JOINED, newChannelId)
            }
        }
        // User has moved to a new voice channel
        else if (oldChannelId !== newChannelId) {
            userAction = `moved to ${newChannelName}`

            // Is the user already stored in the database?
            // @Note: no need to create the user, since they already exist if they are switching voice channels
            const userInDatabase: User | undefined = await dbContext.getUser(guildMember)

            if (userInDatabase) {
                await dbContext.addNewUserPresence(
                    userInDatabase,
                    UserPresenceAction.CHANGED_VOICE_CHANNEL,
                    newChannelId
                )
            }
        } else {
            return
        }

        if (presenceTextChannel === undefined) {
            return
        }

        const textChannel: TextChannel | undefined = client.channels.cache.get(presenceTextChannel) as TextChannel

        if (textChannel === undefined) {
            return
        }

        const embedMessage: MessageEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${username}`)
            .setDescription(`${userAction}`)
            .setFooter(`${timestamp}`)

        textChannel.send(embedMessage)
    }
}
