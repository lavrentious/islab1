import { Migration } from '@mikro-orm/migrations';

export class Migration20251109185155 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "import_operation" ("id" serial primary key, "file_name" varchar(255) not null, "status" text check ("status" in ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED')) not null, "added_count" int null, "created_at" timestamptz not null, "error_message" varchar(255) null);`);

    this.addSql(`alter table "car" alter column "_version" type int using ("_version"::int);`);
    this.addSql(`alter table "car" alter column "_version" set default 0;`);

    this.addSql(`alter table "human_being" alter column "_version" type int using ("_version"::int);`);
    this.addSql(`alter table "human_being" alter column "_version" set default 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "import_operation" cascade;`);

    this.addSql(`alter table "car" alter column "_version" drop default;`);
    this.addSql(`alter table "car" alter column "_version" type int using ("_version"::int);`);

    this.addSql(`alter table "human_being" alter column "_version" drop default;`);
    this.addSql(`alter table "human_being" alter column "_version" type int using ("_version"::int);`);
  }

}
