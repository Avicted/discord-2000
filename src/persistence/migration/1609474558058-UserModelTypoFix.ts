import {MigrationInterface, QueryRunner} from "typeorm";

export class UserModelTypoFix1609474558058 implements MigrationInterface {
    name = 'UserModelTypoFix1609474558058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "nickName" TO "nickname"`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "nickname" TO "nickName"`);
    }

}
