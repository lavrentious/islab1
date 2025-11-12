import { Migration } from '@mikro-orm/migrations';

export class Migration20251112170526 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "failed_count";`);

    this.addSql(`alter table "import_operation" add column "started_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "started_at";`);

    this.addSql(`alter table "import_operation" add column "failed_count" int null;`);
  }

}
