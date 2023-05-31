import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1685536428367 implements MigrationInterface {
    name = 'InitialMigration1685536428367'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE TABLE "jupyter_hub_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "userConf" jsonb NOT NULL,
                "containerImage" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "slug" character varying NOT NULL,
                "instanceFlavour" character varying NOT NULL,
                "instanceCount" integer NOT NULL,
                "creatorId" uuid,
                CONSTRAINT "UQ_ccbf4449bc024eb1a721c536742" UNIQUE ("slug"),
                CONSTRAINT "PK_c3d22153174d138018ef4c465ce" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "jupyter_hub_change_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "userConf" jsonb NOT NULL,
                "containerImage" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "creatorId" uuid,
                "origRequestId" uuid,
                CONSTRAINT "PK_4639935480ca4130bb7b2531232" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "credentials" (
                "userId" uuid NOT NULL,
                "authProvider" character varying NOT NULL,
                "authProviderId" character varying NOT NULL,
                "password" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d3a07b8e994962efe57ebd0f20" PRIMARY KEY ("userId")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "authProviderIndex" ON "credentials" ("authProvider", "authProviderId")
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "isAdmin" boolean NOT NULL DEFAULT false,
                "isLead" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9" FOREIGN KEY ("hubId") REFERENCES "jupyter_hub_request"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "participation"
            ADD CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8" FOREIGN KEY ("participantId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD CONSTRAINT "FK_8d9cfa457ea7d085283b43deccb" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request"
            ADD CONSTRAINT "FK_fb2628ed9a24c0827683a805405" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request"
            ADD CONSTRAINT "FK_bd2dc793883bb8c0c5a1d9c02b6" FOREIGN KEY ("origRequestId") REFERENCES "jupyter_hub_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "credentials"
            ADD CONSTRAINT "FK_8d3a07b8e994962efe57ebd0f20" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "credentials" DROP CONSTRAINT "FK_8d3a07b8e994962efe57ebd0f20"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request" DROP CONSTRAINT "FK_bd2dc793883bb8c0c5a1d9c02b6"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request" DROP CONSTRAINT "FK_fb2628ed9a24c0827683a805405"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP CONSTRAINT "FK_8d9cfa457ea7d085283b43deccb"
        `);
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f48126fafb856a48373bbd7bcc8"
        `);
        await queryRunner.query(`
            ALTER TABLE "participation" DROP CONSTRAINT "FK_f35a85dfd5ac12f38b61c0cf9a9"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."authProviderIndex"
        `);
        await queryRunner.query(`
            DROP TABLE "credentials"
        `);
        await queryRunner.query(`
            DROP TABLE "jupyter_hub_change_request"
        `);
        await queryRunner.query(`
            DROP TABLE "jupyter_hub_request"
        `);
        await queryRunner.query(`
            DROP TABLE "participation"
        `);
    }

}
