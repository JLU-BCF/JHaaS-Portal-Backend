import { MigrationInterface, QueryRunner } from "typeorm";

export class DropPasswordField1689238825192 implements MigrationInterface {
    name = 'DropPasswordField1689238825192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "credentials" DROP COLUMN "password"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "credentials"
            ADD "password" character varying
        `);
    }

}
