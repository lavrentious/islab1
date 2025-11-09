import { Migration } from '@mikro-orm/migrations';

export class Migration20251108132835 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "car" add column "_version" int not null default 0;`);

    this.addSql(`alter table "human_being" add column "_version" int not null default 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "car" drop column "_version";`);

    this.addSql(`alter table "human_being" drop column "_version";`);
  }

}
