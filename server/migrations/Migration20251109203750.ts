import { Migration } from '@mikro-orm/migrations';

export class Migration20251109203750 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being__version_parent_id_foreign";`);

    this.addSql(`alter table "human_being" rename column "_version_parent_id" to "_next_version_id";`);
    this.addSql(`alter table "human_being" add constraint "human_being__next_version_id_foreign" foreign key ("_next_version_id") references "human_being" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being__next_version_id_foreign";`);

    this.addSql(`alter table "human_being" rename column "_next_version_id" to "_version_parent_id";`);
    this.addSql(`alter table "human_being" add constraint "human_being__version_parent_id_foreign" foreign key ("_version_parent_id") references "human_being" ("id") on update cascade on delete set null;`);
  }

}
