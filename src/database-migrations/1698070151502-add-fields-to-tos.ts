import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToTos1698070151502 implements MigrationInterface {
    name = 'AddFieldsToTos1698070151502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tos"
            ADD "draft" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "tos"
            ADD "published_date" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tos" DROP COLUMN "published_date"
        `);
        await queryRunner.query(`
            ALTER TABLE "tos" DROP COLUMN "draft"
        `);
    }

}
