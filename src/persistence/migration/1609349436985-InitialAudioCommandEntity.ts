import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialAudioCommandEntity1609349436985 implements MigrationInterface {
    name = 'InitialAudioCommandEntity1609349436985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audio_command" ("id" SERIAL NOT NULL, "command" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP DEFAULT now(), "userId" character varying, CONSTRAINT "PK_eabc37219bd2dbedf6be8abfca7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`ALTER TABLE "audio_command" ADD CONSTRAINT "FK_e8f07f4f9041bea78eab8a2b2e1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audio_command" DROP CONSTRAINT "FK_e8f07f4f9041bea78eab8a2b2e1"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS NULL`);
        await queryRunner.query(`DROP TABLE "audio_command"`);
    }

}
