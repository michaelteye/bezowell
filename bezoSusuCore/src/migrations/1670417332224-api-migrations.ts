import { MigrationInterface, QueryRunner } from "typeorm";

export class apiMigrations1670417332224 implements MigrationInterface {
    name = 'apiMigrations1670417332224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_entity" DROP COLUMN "test"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction_entity" ADD "test" text`);
    }

}
