import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthentikGroupField1685629700109 implements MigrationInterface {
    name = 'AddAuthentikGroupField1685629700109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD "authentikGroup" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP COLUMN "authentikGroup"
        `);
    }

}
