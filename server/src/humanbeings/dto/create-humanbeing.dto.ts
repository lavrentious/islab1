import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Mood, WeaponType } from "../entities/humanbeing.entity";

export class CoordinatesDto {
  @ApiProperty({ example: 12.34, description: "X coordinate (float)" })
  @IsNumber()
  x!: number;

  @ApiProperty({ example: 42, description: "Y coordinate (int)" })
  @Max(2147483647)
  @IsInt()
  y!: number;
}

export class CreateHumanBeingDto {
  @ApiProperty({ example: "Nikita", description: "Human name" })
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: CoordinatesDto })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsObject()
  coordinates!: CoordinatesDto;

  @ApiProperty({ example: true, description: "Ryan Gosling " })
  @IsBoolean()
  realHero?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: "Whether he has a toothpick",
  })
  @IsOptional()
  @IsBoolean()
  hasToothpick?: boolean | null;

  @ApiPropertyOptional({ example: 1, description: "Existing car ID" })
  @IsOptional()
  @IsInt()
  car?: number;

  @ApiProperty({ enum: Mood, description: "Current mood" })
  @IsEnum(Mood)
  mood!: Mood;

  @ApiProperty({ example: 99.9, description: "Impact speed" })
  @IsOptional()
  @Max(2147483647)
  @IsNumber()
  impactSpeed?: number | null;

  @ApiProperty({
    example: "College, Electric Youth - A Real Hero",
    description: "Soundtrack name",
  })
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  soundtrackName!: string;

  @ApiPropertyOptional({
    example: 42,
    description: "Minutes of waiting",
  })
  @Max(2147483647)
  @IsOptional()
  @IsInt()
  minutesOfWaiting?: number | null;

  @ApiProperty({ enum: WeaponType, description: "Weapon type" })
  @IsEnum(WeaponType)
  weaponType!: WeaponType;
}
