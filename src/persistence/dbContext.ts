import { GuildMember } from 'discord.js'
import { getConnection, InsertResult } from 'typeorm'
import { UserPresenceAction } from '../enums/userPresenceAction'
import { User } from './entity/User'
import { UserPresence } from './entity/UserPresence'

// @Note: database access methods that can be used anywhere in the application
export class DbContext {
    public async getUser(user: GuildMember): Promise<User | undefined> {
        return await getConnection()
            .getRepository(User)
            .createQueryBuilder('user')
            .where('user.id = :id', { id: user.id })
            .getOne()
    }

    public async createNewUser(user: GuildMember): Promise<InsertResult> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {
                    id: user.id,
                    displayName: user.displayName,
                    nickname: user.nickname !== null ? user.nickname : undefined,
                },
            ])
            .execute()
    }

    public async addNewUserPresence(
        userInDatabase: User,
        userPresenceAction: UserPresenceAction
    ): Promise<InsertResult> {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(UserPresence)
            .values([
                {
                    user: userInDatabase,
                    action: userPresenceAction,
                },
            ])
            .execute()
    }
}
