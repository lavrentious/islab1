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
  ValidateNested,
} from "class-validator";
import { Mood, WeaponType } from "../entities/humanbeing";

class CoordinatesDto {
  @ApiProperty({ example: 12.34, description: "X coordinate (float)" })
  @IsNumber()
  x!: number;

  @ApiProperty({ example: 42, description: "Y coordinate (int)" })
  @IsInt()
  y!: number;
}

class CarDto {
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

export class CreateHumanBeingDto {
  @ApiProperty({ example: "Nikita", description: "Human name" })
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

  @ApiProperty({ type: CarDto })
  @ValidateNested()
  @Type(() => CarDto)
  @IsObject()
  car!: CarDto;

  @ApiProperty({ enum: Mood, description: "Current mood" })
  @IsEnum(Mood)
  mood!: Mood;

  @ApiProperty({ example: 99.9, description: "Impact speed" })
  @IsOptional()
  @IsNumber()
  impactSpeed?: number | null;

  @ApiProperty({
    example: "College, Electric Youth - A Real Hero",
    description: "Soundtrack name",
  })
  @IsString()
  soundtrackName!: string;

  @ApiPropertyOptional({
    example: 42,
    description: "Minutes of waiting",
  })
  @IsOptional()
  @IsInt()
  minutesOfWaiting?: number | null;

  @ApiProperty({ enum: WeaponType, description: "Weapon type" })
  @IsEnum(WeaponType)
  weaponType!: WeaponType;
}
