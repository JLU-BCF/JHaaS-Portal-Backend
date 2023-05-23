import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParticipation1684842713581 implements MigrationInterface {
    name = 'AddParticipation1684842713581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "participant" (
                "id" uuid NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_64da4237f502041781ca15d4c41" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "participation" (
                "hubId" uuid NOT NULL,
                "participantId" uuid NOT NULL,
                "status" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_696d524a5f3f9b992615316c612" PRIMARY KEY ("hubId", "participantId")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9" FOREIGN KEY ("hubId") REFERENCES "jupyter_hub_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8"
        `);
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9"
        `);
        await queryRunner.query(`
            DROP TABLE "participation"
        `);
        await queryRunner.query(`
            DROP TABLE "participant"
        `);
    }

}
