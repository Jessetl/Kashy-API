import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNotificationFieldsToUsersTable1711700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'notification_enabled',
        type: 'boolean',
        default: true,
      }),
      new TableColumn({
        name: 'fcm_token',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'fcm_token');
    await queryRunner.dropColumn('users', 'notification_enabled');
  }
}
