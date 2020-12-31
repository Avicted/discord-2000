import {MigrationInterface, QueryRunner} from "typeorm";

export class UserNicknameIsNowNullable1609417667816 implements MigrationInterface {
    name = 'UserNicknameIsNowNullable1609417667816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "nickName" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."nickName" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."nickName" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "nickName" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user_presence"."createdAt" IS NULL`);
    }

}
