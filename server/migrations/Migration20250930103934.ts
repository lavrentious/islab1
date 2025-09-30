import { Migration } from '@mikro-orm/migrations';

export class Migration20250930103934 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "car_name" type varchar(255) using ("car_name"::varchar(255));`);
    this.addSql(`alter table "human_being" alter column "car_name" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "car_name" type varchar(255) using ("car_name"::varchar(255));`);
    this.addSql(`alter table "human_being" alter column "car_name" set not null;`);
  }

}
