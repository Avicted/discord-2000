import { format, utcToZonedTime } from "date-fns-tz"
import { GuildMember, MessageEmbed, TextChannel, VoiceState } from "discord.js"
import { getConnection } from "typeorm"
import { User } from "../entity/User"
import { UserPresence } from "../entity/UserPresence"
import { UserPresenceAction } from "../enums/userPresenceAction"
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
        const timestamp: string = `Time: ${format(utcToZonedTime(new Date(), timezone), 'yyyy-MM-dd HH:mm:ss', { timeZone: timezone })}`
        let userAction: string = ''

        // User has disconnected from a voice channel
        if (newChannelId === undefined) {
            userAction = `has disconnected from ${oldChannelName}`

            let userInDatabase: User | undefined = await getConnection()
                .getRepository(User)
                .createQueryBuilder('user')
                .where('user.id = :id', { id: user.id })
                .getOne()

            if (!userInDatabase) {
                // Create the user
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values([
                        {
                            id: user.id,
                            displayName: user.displayName,
                            nickName: username,
                        },
                    ])
                    .execute()

                userInDatabase = await getConnection()
                    .getRepository(User)
                    .createQueryBuilder('user')
                    .where('user.id = :id', { id: user.id })
                    .getOne()
            }


            // Add a new userPresence row
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(UserPresence)
                .values([
                    {
                        user: userInDatabase,
                        action: UserPresenceAction.DISCONNECTED
                    },
                ])
                .execute()
        }
        // User has joined a voice channel
        else if (oldChannelId === undefined && newChannelId !== undefined) {
            userAction = `has joined ${newChannelName}`

            // Is the user already stored in the database?
            let userInDatabase: User | undefined = await getConnection()
                .getRepository(User)
                .createQueryBuilder('user')
                .where('user.id = :id', { id: user.id })
                .getOne()

            if (userInDatabase) {
                // Update the users nickname and updatedAt
                await getConnection()
                    .createQueryBuilder()
                    .update(User)
                    .set({
                        nickName: username,
                    })
                    .where('id = :id', { id: user.id })
                    .execute()
            }
            else {
                // Create the user
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User)
                    .values([
                        {
                            id: user.id,
                            displayName: user.displayName,
                            nickName: username,
                        },
                    ])
                    .execute()

                userInDatabase = await getConnection()
                    .getRepository(User)
                    .createQueryBuilder('user')
                    .where('user.id = :id', { id: user.id })
                    .getOne()
            }

            // Add a new userPresence row
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(UserPresence)
                .values([
                    {
                        user: userInDatabase,
                        action: UserPresenceAction.JOINED
                    },
                ])
                .execute()
        }
        // User has moved to a new voice channel
        else if (oldChannelId !== newChannelId) {
            userAction = `moved to ${newChannelName}`
        }
        else {
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