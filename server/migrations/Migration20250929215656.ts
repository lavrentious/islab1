import { Migration } from '@mikro-orm/migrations';

export class Migration20250929215656 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "impact_speed" type bigint using ("impact_speed"::bigint);`);
    this.addSql(`alter table "human_being" alter column "minutes_of_waiting" type bigint using ("minutes_of_waiting"::bigint);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "impact_speed" type varchar(255) using ("impact_speed"::varchar(255));`);
    this.addSql(`alter table "human_being" alter column "minutes_of_waiting" type varchar(255) using ("minutes_of_waiting"::varchar(255));`);
  }

}
