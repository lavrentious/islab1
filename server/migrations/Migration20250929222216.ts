import { Migration } from '@mikro-orm/migrations';

export class Migration20250929222216 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "coordinates_x" type double precision using ("coordinates_x"::double precision);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "human_being" alter column "coordinates_x" type float using ("coordinates_x"::float);`);
  }

}
