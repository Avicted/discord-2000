import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class UserPresence {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.userPresence)
    user!: User

    @Column()
    action?: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
