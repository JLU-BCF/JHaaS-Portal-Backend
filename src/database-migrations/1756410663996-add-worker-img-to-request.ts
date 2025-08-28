import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkerImgToRequest1756410663996 implements MigrationInterface {
    name = 'AddWorkerImgToRequest1756410663996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD "workerImage" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request"
            ADD "workerImage" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request" DROP COLUMN "workerImage"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP COLUMN "workerImage"
        `);
    }

}
