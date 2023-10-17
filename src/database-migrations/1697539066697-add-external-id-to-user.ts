import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExternalIdToUser1697539066697 implements MigrationInterface {
    name = 'AddExternalIdToUser1697539066697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "externalId" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "externalId"
        `);
    }

}
