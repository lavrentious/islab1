import { Migration } from "@mikro-orm/migrations";

export class Migration20251002085230 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE OR REPLACE FUNCTION group_by_car()
      RETURNS TABLE(car int, total bigint) AS $$
      BEGIN
        RETURN QUERY
        SELECT human_being."car_id" as "cid", COUNT(*)
        FROM human_being
        GROUP BY "cid"
        ORDER BY "cid";
      END;
      $$ LANGUAGE plpgsql;
    `);

    this.addSql(`
      CREATE OR REPLACE FUNCTION count_impact_speed_less_than(threshold int)
      RETURNS bigint AS $$
      DECLARE result bigint;
      BEGIN
        SELECT COUNT(*) INTO result
        FROM human_being
        WHERE "impact_speed" IS NOT NULL AND "impact_speed" < threshold;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `);

    this.addSql(`
      CREATE OR REPLACE FUNCTION unique_weapon_types()
      RETURNS text[] AS $$
      DECLARE result text[];
      BEGIN
        SELECT ARRAY_AGG(DISTINCT "weapon_type") INTO result
        FROM human_being;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `);

    this.addSql(`
      CREATE OR REPLACE FUNCTION delete_without_toothpicks()
      RETURNS bigint AS $$
      DECLARE deleted_count bigint;
      BEGIN
        DELETE FROM human_being WHERE "has_toothpick" = false OR "has_toothpick" IS NULL;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
    `);

    this.addSql(`
      CREATE OR REPLACE FUNCTION assign_car_to_carless(target_car_id INT)
      RETURNS bigint AS $$
      DECLARE updated_count bigint;
      BEGIN
        UPDATE human_being
        SET car_id = target_car_id
        WHERE car_id IS NULL;
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        RETURN updated_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  override async down(): Promise<void> {
    this.addSql("DROP FUNCTION IF EXISTS group_by_car();");
    this.addSql("DROP FUNCTION IF EXISTS count_impact_speed_less_than(int);");
    this.addSql("DROP FUNCTION IF EXISTS unique_weapon_types();");
    this.addSql("DROP FUNCTION IF EXISTS delete_without_toothpicks();");
    this.addSql(`DROP FUNCTION IF EXISTS assign_car_to_carless(INT);`);
  }
}
