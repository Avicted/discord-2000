import { GuildMember } from 'discord.js'
import { getConnection, InsertResult } from 'typeorm'
import { UserPresenceAction } from '../enums/userPresenceAction'
import { User } from './entity/User'
import { UserPresence } from './entity/UserPresence'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { formatDuration, intervalToDuration } from 'date-fns'
import { AudioCommand } from './entity/AudioCommand'
import { ITopAudioCommand } from '../interfaces/topAudioCommands'

// @Note: database access methods that can be used anywhere in the application
export class DbContext {
    public async getUser(user: GuildMember): Promise<User | undefined> {
        return await getConnection()
            .getRepository(User)
            .createQueryBuilder('user')
            .where('user.id = :id', { id: user.id })
            .getOne()
    }

    public async createNewUser(user: GuildMember, isBot: boolean): Promise<InsertResult> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {
                    id: user.id,
                    displayName: user.displayName,
                    nickname: user.nickname !== null ? user.nickname : undefined,
                    isBot: isBot,
                },
            ])
            .execute()
    }

    public async addNewUserPresence(
        userInDatabase: User,
        userPresenceAction: UserPresenceAction,
        newVoiceChannelId?: string
    ): Promise<InsertResult> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(UserPresence)
            .values([
                {
                    user: userInDatabase,
                    action: userPresenceAction,
                    newVoiceChannelId: newVoiceChannelId,
                },
            ])
            .execute()
    }

    // Calculate the days, hours and minues that a user has been
    // online in this Discord server. Online is defined as being in a voice channel of the Discord server.
    public async userOnlineTimeInServerTotal(user: GuildMember): Promise<string | undefined> {
        const userInDatabase: User | undefined = await getConnection()
            .getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userPresence', 'userPresence')
            .where('user.id = :id', { id: user.id })
            .getOne()

        if (userInDatabase === undefined) {
            return undefined
        }

        if (userInDatabase.userPresence.length <= 0) {
            return undefined
        }

        let lookingForActionJoined: boolean = true
        let lookingForActionDisconnected: boolean = false
        let currentTimeInterval: { joined: Date | undefined; disconnected: Date | undefined } = {
            joined: undefined,
            disconnected: undefined,
        }
        let totalSecondsConnectedToDiscordServer: number = 0

        userInDatabase.userPresence.forEach((userPresence: UserPresence) => {
            if (lookingForActionJoined) {
                if (userPresence.action !== UserPresenceAction.JOINED) {
                    return
                }

                currentTimeInterval.joined = userPresence.createdAt

                lookingForActionJoined = false
                lookingForActionDisconnected = true
            } else if (lookingForActionDisconnected) {
                if (userPresence.action !== UserPresenceAction.DISCONNECTED) {
                    return
                }

                currentTimeInterval.disconnected = userPresence.createdAt

                lookingForActionJoined = true
                lookingForActionDisconnected = false
            }

            // If both currentTimeInterval.joined and disconnected are known, we calculate the
            // time duration between them. Store the duration and reset currentTimeInterval
            if (currentTimeInterval.joined !== undefined && currentTimeInterval.disconnected !== undefined) {
                const durationInSeconds: number = differenceInSeconds(
                    currentTimeInterval.disconnected,
                    currentTimeInterval.joined
                )

                totalSecondsConnectedToDiscordServer += durationInSeconds

                currentTimeInterval.disconnected = undefined
                currentTimeInterval.joined = undefined
            }
        })

        // If the user has not disconnected yet and is currently online, then we need to calculate the
        // time from when the user joined to the current time
        if (currentTimeInterval.joined !== undefined && currentTimeInterval.disconnected === undefined) {
            const durationInSeconds: number = differenceInSeconds(new Date(), currentTimeInterval.joined)
            totalSecondsConnectedToDiscordServer += durationInSeconds
        }

        const humanReadableTimeConnectedToServer: string = formatDuration(
            intervalToDuration({ start: 0, end: totalSecondsConnectedToDiscordServer * 1000 })
        )

        console.log({
            info: 'DbContext: userOnlineTimeInServerTotal',
            user: userInDatabase.displayName,
            humanReadableTimeConnectedToServer,
        })

        return humanReadableTimeConnectedToServer
    }

    public async topTenAudioCommands(): Promise<ITopAudioCommand[]> {
        const topAudioCommands: ITopAudioCommand[] = await getConnection()
            .getRepository(AudioCommand)
            .createQueryBuilder('audio_command')
            .select('audio_command.command AS command')
            .addSelect('COUNT(*) AS count')
            .groupBy('audio_command.command')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany()

        console.log({
            info: 'topTenAudioCommands',
            topAudioCommands,
        })

        return topAudioCommands
    }
}
