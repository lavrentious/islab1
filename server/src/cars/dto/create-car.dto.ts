import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateCarDto {
  @ApiProperty({ example: "honda civic", description: "Car name" })
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the car is cool",
  })
  @IsBoolean()
  @IsOptional()
  cool?: boolean | null;
}
