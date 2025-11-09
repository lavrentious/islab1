import { Migration } from '@mikro-orm/migrations';

export class Migration20251109185329 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "import_operation" add column "failed_count" int null, add column "duplicate_count" int null;`);
    this.addSql(`alter table "import_operation" rename column "added_count" to "ok_count";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "failed_count", drop column "duplicate_count";`);

    this.addSql(`alter table "import_operation" rename column "ok_count" to "added_count";`);
  }

}
