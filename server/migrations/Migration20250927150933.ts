import { Migration } from '@mikro-orm/migrations';

export class Migration20250927150933 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "human_being" ("id" serial primary key, "name" varchar(255) not null, "coordinates_x" int not null, "coordinates_y" int not null, "creation_date" timestamptz not null, "real_hero" boolean not null, "has_toothpick" varchar(255) null, "car_name" varchar(255) not null, "car_cool" varchar(255) null, "mood" smallint not null, "impact_speed" varchar(255) null, "soundtrack_name" varchar(255) not null, "minutes_of_waiting" varchar(255) null, "weapon_type" smallint not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "human_being" cascade;`);
  }

}
