import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotebookDefaultUrlField1687186582222 implements MigrationInterface {
    name = 'AddNotebookDefaultUrlField1687186582222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD "notebookDefaultUrl" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request"
            ADD "notebookDefaultUrl" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request" DROP COLUMN "notebookDefaultUrl"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP COLUMN "notebookDefaultUrl"
        `);
    }

}
