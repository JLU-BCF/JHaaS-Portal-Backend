import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHubUrlField1687163402269 implements MigrationInterface {
    name = 'AddHubUrlField1687163402269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD "hubUrl" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP COLUMN "hubUrl"
        `);
    }

}
