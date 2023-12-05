import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJhSecretsTable1701771600920 implements MigrationInterface {
    name = 'CreateJhSecretsTable1701771600920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "jupyter_hub_secrets" (
                "hubId" uuid NOT NULL,
                "apiToken" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_14ce0435e91041c1a1de272ca52" PRIMARY KEY ("hubId")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_secrets"
            ADD CONSTRAINT "FK_14ce0435e91041c1a1de272ca52" FOREIGN KEY ("hubId") REFERENCES "jupyter_hub_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_secrets" DROP CONSTRAINT "FK_14ce0435e91041c1a1de272ca52"
        `);
        await queryRunner.query(`
            DROP TABLE "jupyter_hub_secrets"
        `);
    }

}
