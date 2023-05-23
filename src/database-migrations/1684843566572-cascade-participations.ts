import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeParticipations1684843566572 implements MigrationInterface {
    name = 'CascadeParticipations1684843566572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9"
        `);
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8"
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9" FOREIGN KEY ("hubId") REFERENCES "jupyter_hub_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9" FOREIGN KEY ("hubId") REFERENCES "jupyter_hub_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
