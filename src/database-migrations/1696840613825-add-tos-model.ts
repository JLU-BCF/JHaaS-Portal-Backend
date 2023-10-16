import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTosModel1696840613825 implements MigrationInterface {
    name = 'AddTosModel1696840613825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "text_markdown" character varying NOT NULL,
                "text_html" character varying NOT NULL,
                "validity_start" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b5c216a88356dde80d0cd61d7f5" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tos"
        `);
    }

}
