import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769051571950 implements MigrationInterface {
    name = 'Migration1769051571950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sys_user\` ADD \`name\` varchar(255) NOT NULL COMMENT '测试字段'`);
        await queryRunner.query(`ALTER TABLE \`sys_user\` ADD \`name1\` varchar(255) NOT NULL COMMENT '测试字段1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sys_user\` DROP COLUMN \`name1\``);
        await queryRunner.query(`ALTER TABLE \`sys_user\` DROP COLUMN \`name\``);
    }

}
