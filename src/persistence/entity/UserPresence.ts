import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from './User'

@Entity()
export class UserPresence {
    // Unique ID for this table, not corresponding to the Discord user ID.
    @PrimaryGeneratedColumn()
    id!: number

    // The user in question
    @ManyToOne(() => User, (user) => user.userPresence)
    user!: User

    // Which action did they invoke?
    @Column()
    action!: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
