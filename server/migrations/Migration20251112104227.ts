import { Migration } from '@mikro-orm/migrations';

export class Migration20251112104227 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "import_operation" add column "file_hash" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "import_operation" drop column "file_hash";`);
  }

}
