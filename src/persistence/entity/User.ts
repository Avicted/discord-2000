import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { AudioCommand } from './AudioCommand'
import { UserPresence } from './UserPresence'

@Entity()
export class User {
    @PrimaryColumn()
    id!: string

    @Column()
    displayName!: string

    @Column({ nullable: true })
    nickName?: string

    @OneToMany(() => AudioCommand, (audioCommand) => audioCommand.user)
    audioCommands!: AudioCommand[]

    @OneToMany(() => UserPresence, (userPresence) => userPresence.user)
    userPresence!: UserPresence[]

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
