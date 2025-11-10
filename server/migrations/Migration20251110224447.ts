import { Migration } from '@mikro-orm/migrations';

export class Migration20251110224447 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "import_operation" add column "entry_count" int null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "entry_count";`);
  }

}
