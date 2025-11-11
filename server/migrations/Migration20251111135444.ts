import { Migration } from '@mikro-orm/migrations';

export class Migration20251111135444 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "car" drop column "_version";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "car" add column "_version" int not null default 0;`);
  }

}
