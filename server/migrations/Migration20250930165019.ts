import { Migration } from '@mikro-orm/migrations';

export class Migration20250930165019 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being_car_id_foreign";`);

    this.addSql(`alter table "human_being" alter column "car_id" type int using ("car_id"::int);`);
    this.addSql(`alter table "human_being" alter column "car_id" drop not null;`);
    this.addSql(`alter table "human_being" add constraint "human_being_car_id_foreign" foreign key ("car_id") references "car" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint "human_being_car_id_foreign";`);

    this.addSql(`alter table "human_being" alter column "car_id" type int using ("car_id"::int);`);
    this.addSql(`alter table "human_being" alter column "car_id" set not null;`);
    this.addSql(`alter table "human_being" add constraint "human_being_car_id_foreign" foreign key ("car_id") references "car" ("id") on update cascade;`);
  }

}
