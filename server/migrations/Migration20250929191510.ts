import { Migration } from '@mikro-orm/migrations';

export class Migration20250929191510 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "has_toothpick" type boolean using ("has_toothpick"::boolean);`);
    this.addSql(`alter table "human_being" alter column "car_cool" type boolean using ("car_cool"::boolean);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "has_toothpick" type varchar(255) using ("has_toothpick"::varchar(255));`);
    this.addSql(`alter table "human_being" alter column "car_cool" type varchar(255) using ("car_cool"::varchar(255));`);
  }

}
