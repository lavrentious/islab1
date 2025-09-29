import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsSemVer,
  IsString,
  validateSync,
} from "class-validator";

export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsSemVer()
  @IsString()
  VERSION: Environment;

  @IsString()
  LAST_COMMIT_DATE: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_HOST: string;

  @IsString()
  DB_PORT: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  API_URL: string;

  @IsString()
  CLIENT_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
