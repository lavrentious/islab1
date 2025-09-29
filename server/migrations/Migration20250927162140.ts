import { Migration } from '@mikro-orm/migrations';

export class Migration20250927162140 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint if exists "human_being_mood_check";`);
    this.addSql(`alter table "human_being" drop constraint if exists "human_being_weapon_type_check";`);

    this.addSql(`alter table "human_being" alter column "mood" type text using ("mood"::text);`);
    this.addSql(`alter table "human_being" alter column "weapon_type" type text using ("weapon_type"::text);`);
    this.addSql(`alter table "human_being" add constraint "human_being_mood_check" check("mood" in ('SADNESS', 'SORROW', 'LONGING', 'APATHY', 'CALM'));`);
    this.addSql(`alter table "human_being" add constraint "human_being_weapon_type_check" check("weapon_type" in ('HAMMER', 'SHOTGUN', 'RIFLE'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" drop constraint if exists "human_being_mood_check";`);
    this.addSql(`alter table "human_being" drop constraint if exists "human_being_weapon_type_check";`);

    this.addSql(`alter table "human_being" alter column "mood" type smallint using ("mood"::smallint);`);
    this.addSql(`alter table "human_being" alter column "weapon_type" type smallint using ("weapon_type"::smallint);`);
  }

}
