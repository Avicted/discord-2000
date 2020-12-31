import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialUserModel1609343793765 implements MigrationInterface {
    name = 'InitialUserModel1609343793765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "displayName" character varying NOT NULL, "nickName" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
