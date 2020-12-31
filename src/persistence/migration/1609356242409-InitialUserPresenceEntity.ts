import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialUserPresenceEntity1609356242409 implements MigrationInterface {
    name = 'InitialUserPresenceEntity1609356242409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_presence" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP DEFAULT now(), "userId" character varying, CONSTRAINT "PK_562d693ca2ee27d96b75ff78eda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_presence" ADD CONSTRAINT "FK_b06e00b58bf86a3772b1251ac02" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_presence" DROP CONSTRAINT "FK_b06e00b58bf86a3772b1251ac02"`);
        await queryRunner.query(`COMMENT ON COLUMN "audio_command"."createdAt" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`DROP TABLE "user_presence"`);
    }

}
