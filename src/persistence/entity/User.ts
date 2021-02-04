import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { AudioCommand } from './AudioCommand'
import { UserPresence } from './UserPresence'

@Entity()
export class User {
    // Discord user id
    @PrimaryColumn()
    id!: string

    // Discord user displayName
    @Column()
    displayName!: string

    // Discord user nickname if it is set
    @Column({ nullable: true })
    nickname?: string

    @Column({ nullable: true })
    isBot?: boolean

    // <!play> commands that the user has issued
    @OneToMany(() => AudioCommand, (audioCommand) => audioCommand.user)
    audioCommands!: AudioCommand[]

    // Every connect / disconnect that the user has made to a voice channel through voiceStateUpdate.ts
    @OneToMany(() => UserPresence, (userPresence) => userPresence.user)
    userPresence!: UserPresence[]

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
