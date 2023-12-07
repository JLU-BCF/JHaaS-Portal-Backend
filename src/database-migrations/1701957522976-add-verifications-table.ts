import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationsTable1701957522976 implements MigrationInterface {
    name = 'AddVerificationsTable1701957522976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "verification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "purpose" character varying NOT NULL,
                "target" character varying NOT NULL,
                "expiry" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "verification"
            ADD CONSTRAINT "FK_8300048608d8721aea27747b07a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "verification" DROP CONSTRAINT "FK_8300048608d8721aea27747b07a"
        `);
        await queryRunner.query(`
            DROP TABLE "verification"
        `);
    }

}
