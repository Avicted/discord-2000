import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from './User'

@Entity()
export class AudioCommand {
    // Unique ID for this table, not corresponding to the Discord user ID.
    @PrimaryGeneratedColumn()
    id!: number

    // The user in question
    @ManyToOne(() => User, (user) => user.audioCommands)
    user!: User

    // Which <!play> command did the user execute?
    @Column()
    command!: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
