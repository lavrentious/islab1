import { Migration } from '@mikro-orm/migrations';

export class Migration20250930163559 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "car" add constraint "car_name_unique" unique ("name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "car" drop constraint "car_name_unique";`);
  }

}
