import { Migration } from '@mikro-orm/migrations';

export class Migration20251109202036 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" add column "_version_parent_id" int null, add column "_version_root_id" int null;`);
    this.addSql(`alter table "human_being" add constraint "human_being__version_parent_id_foreign" foreign key ("_version_parent_id") references "human_being" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "human_being" add constraint "human_being__version_root_id_foreign" foreign key ("_version_root_id") references "human_being" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being__version_parent_id_foreign";`);
    this.addSql(`alter table "human_being" drop constraint "human_being__version_root_id_foreign";`);

    this.addSql(`alter table "human_being" drop column "_version_parent_id", drop column "_version_root_id";`);
  }

}
