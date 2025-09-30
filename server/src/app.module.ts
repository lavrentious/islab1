import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EnvironmentVariables, validate } from "./env.validation";
import { HumanBeingsModule } from "./humanbeings/humanbeings.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === "development"
          ? ".env.development"
          : ".env.production",
      validate,
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        dbName: configService.get("DB_NAME"),
        user: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        entities: ["./dist/**/entities/*"],
        entitiesTs: ["./src/**/entities/*"],
        driver: PostgreSqlDriver,
      }),
      inject: [ConfigService],
      driver: PostgreSqlDriver,
    }),
    HumanBeingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
