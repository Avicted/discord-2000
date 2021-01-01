import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedNewVoiceChannelIdToUserPresence1609526407818 implements MigrationInterface {
    name = 'AddedNewVoiceChannelIdToUserPresence1609526407818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_presence" ADD "newVoiceChannelId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_presence" DROP COLUMN "newVoiceChannelId"`);
    }

}
