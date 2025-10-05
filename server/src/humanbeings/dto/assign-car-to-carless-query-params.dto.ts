import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class AssignCarToCarlessQueryParamsDto {
  @ApiProperty()
  @IsNumber()
  car: number;
}
