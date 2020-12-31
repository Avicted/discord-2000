import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { User } from "./User";

@Entity()
export class AudioCommand {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, user => user.audioCommands)
    user!: User

    @Column()
    command!: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
