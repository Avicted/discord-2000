import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedIsBotFieldToUser1612450009048 implements MigrationInterface {
    name = 'AddedIsBotFieldToUser1612450009048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isBot" boolean`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isBot"`);
    }

}
