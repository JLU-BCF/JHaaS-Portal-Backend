import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSharedVolumeConf1756410420319 implements MigrationInterface {
    name = 'AddSharedVolumeConf1756410420319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request"
            ADD "sharedVolumesConf" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request"
            ADD "sharedVolumesConf" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_change_request" DROP COLUMN "sharedVolumesConf"
        `);
        await queryRunner.query(`
            ALTER TABLE "jupyter_hub_request" DROP COLUMN "sharedVolumesConf"
        `);
    }

}
