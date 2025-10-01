import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { PaginateParams } from "src/common/dto/pagination.dto";
import { nullableBooleanFromString } from "src/common/utils/queryparams.utils";
import { Car } from "../entities/car.entity";

export class FindAllCarsQueryParamsDto extends PaginateParams {
  // filters
  @ApiPropertyOptional({ example: "honda civic" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    nullableBooleanFromString(value as string | undefined | null),
  )
  @IsBoolean()
  @IsOptional()
  cool?: boolean | null;

  // sorting
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(["id", "name", "cool"] as (keyof Car)[])
  @IsString()
  sortBy?: keyof Car;

  @ApiPropertyOptional({ default: "ASC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
