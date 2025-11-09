import { Migration } from '@mikro-orm/migrations';

export class Migration20251109190602 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "import_operation" add column "finished_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "finished_at";`);
  }

}
