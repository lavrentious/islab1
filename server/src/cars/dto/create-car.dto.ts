import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateCarDto {
  @ApiProperty({ example: "honda civic", description: "Car name" })
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
