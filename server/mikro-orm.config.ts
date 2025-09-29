// mikro-orm.config.ts
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  driver: PostgreSqlDriver,
  entities: ["./dist/**/entities/*"],
  entitiesTs: ["./src/**/entities/*"],

  extensions: [Migrator],

  migrations: {
    path: "./migrations", // where generated migration files will be stored
    pathTs: "./migrations", // path for TS files (during dev)
    glob: "!(*.d).{js,ts}", // match .ts or .js files
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    emit: "ts", // generate TS migrations
  },
});
