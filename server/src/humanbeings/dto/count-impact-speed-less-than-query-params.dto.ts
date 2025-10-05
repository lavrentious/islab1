import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class CountImpactSpeedLessThanQueryParamsDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => +value)
  threshold: number;
}
