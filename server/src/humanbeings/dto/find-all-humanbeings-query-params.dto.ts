import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { PaginateParams } from "src/common/dto/pagination.dto";
import {
  booleanFromString,
  nullableBooleanFromString,
} from "src/common/utils/queryparams.utils";
import { HumanBeing, Mood, WeaponType } from "../entities/humanbeing.entity";

export class FindAllHumanbeingsQueryParamsDto extends PaginateParams {
  @ApiPropertyOptional()
  @Transform(({ value }) => booleanFromString(value as string))
  @IsBoolean()
  @IsOptional()
  onlyLatestVersions?: boolean;

  // filters
  @ApiPropertyOptional({ example: "joe biden" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Ryan Gosling" })
  @Transform(
    ({ value }) =>
      (value === undefined ? value : value === "true") as boolean | undefined,
  )
  @IsBoolean()
  @IsOptional()
  realHero?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    nullableBooleanFromString(value as string | undefined | null),
  )
  @IsBoolean()
  @IsOptional()
  hasToothpick?: boolean | null;

  @ApiPropertyOptional({ enum: Mood })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @ApiPropertyOptional({ example: "honda civic" })
  @Transform(({ value }) =>
    booleanFromString(value as string | undefined | null),
  )
  @IsBoolean()
  @IsOptional()
  hasCar?: boolean;

  @ApiPropertyOptional({ example: "honda civic" })
  @IsOptional()
  @IsString()
  carName?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    nullableBooleanFromString(value as string | undefined | null),
  )
  @IsBoolean()
  @IsOptional()
  carCool?: boolean | null;

  @ApiPropertyOptional({ enum: WeaponType })
  @IsOptional()
  @IsEnum(WeaponType)
  weaponType?: WeaponType;

  @ApiPropertyOptional({ example: "College, Electric Youth - A Real Hero" })
  @IsOptional()
  @IsString()
  soundtrackName?: string;

  // sorting
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([
    "id",
    "name",
    "realHero",
    "hasToothpick",
    "mood",
    "car.name",
    "car.cool",
    "weaponType",
    "soundtrackName",
    "creationDate",
    "coordinates_x",
    "coordinates_y",
    "impactSpeed",
    "minutesOfWaiting",
  ] as (keyof HumanBeing)[])
  @IsString()
  sortBy?: keyof HumanBeing;

  @ApiPropertyOptional({ default: "ASC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
