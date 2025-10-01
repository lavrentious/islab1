import { Migration } from '@mikro-orm/migrations';

export class Migration20250930162827 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "car" ("id" serial primary key, "name" varchar(255) not null, "cool" boolean null);`);

    this.addSql(`alter table "human_being" drop column "car_name", drop column "car_cool";`);

    this.addSql(`alter table "human_being" add column "car_id" int not null;`);
    this.addSql(`alter table "human_being" add constraint "human_being_car_id_foreign" foreign key ("car_id") references "car" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being_car_id_foreign";`);

    this.addSql(`drop table if exists "car" cascade;`);

    this.addSql(`alter table "human_being" drop column "car_id";`);

    this.addSql(`alter table "human_being" add column "car_name" varchar(255) null, add column "car_cool" boolean null;`);
  }

}
