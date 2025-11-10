import { Migration } from '@mikro-orm/migrations';

export class Migration20251110204412 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create index "human_being_name_index" on "human_being" ("name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "human_being_name_index";`);
  }

}
