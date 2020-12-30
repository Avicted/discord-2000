import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { AudioCommand } from "./AudioCommand";

@Entity()
export class User {
    @PrimaryColumn()
    id!: string

    @Column()
    displayName!: string

    @Column()
    nickName?: string

    @OneToMany(() => AudioCommand, audioCommand => audioCommand.user)
    audioCommands!: AudioCommand[]

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date

    @UpdateDateColumn({ type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP', nullable: true })
    updatedAt!: Date
}
