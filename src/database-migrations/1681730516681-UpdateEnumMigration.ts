import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumMigration1681730516681 implements MigrationInterface {
    name = 'UpdateEnumMigration1681730516681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jupyter_hub_request" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_request" ADD "status" character varying NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_change_request" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_change_request" ADD "status" character varying NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jupyter_hub_change_request" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_change_request" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_request" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "jupyter_hub_request" ADD "status" integer NOT NULL`);
    }

}
