import { ApiProperty } from "@nestjs/swagger";
import { HumanBeing, Mood, WeaponType } from "../entities/humanbeing.entity";
import { CoordinatesDto } from "./create-humanbeing.dto";

export class HumanBeingDto implements Partial<Omit<HumanBeing, "car">> {
  constructor(humanBeing: HumanBeing) {
    Object.assign(this, humanBeing);
    this.car = humanBeing.car?.id ?? null;
  }

  @ApiProperty()
  id!: number;

  @ApiProperty({ example: "Nikita", description: "Human name" })
  name!: string;

  @ApiProperty({ type: CoordinatesDto })
  coordinates!: CoordinatesDto;

  @ApiProperty({ example: true, description: "Ryan Gosling " })
  realHero!: boolean;

  @ApiProperty({
    example: false,
    description: "Whether he has a toothpick",
    nullable: true,
  })
  hasToothpick!: boolean | null;

  @ApiProperty({ example: 1, description: "Existing car ID", nullable: true })
  car!: number | null;

  @ApiProperty({ enum: Mood, description: "Current mood" })
  mood!: Mood;

  @ApiProperty({ example: 99.9, description: "Impact speed", nullable: true })
  impactSpeed!: number | null;

  @ApiProperty({
    example: "College, Electric Youth - A Real Hero",
    description: "Soundtrack name",
  })
  soundtrackName!: string;

  @ApiProperty({
    example: 42,
    description: "Minutes of waiting",
    nullable: true,
  })
  minutesOfWaiting!: number | null;

  @ApiProperty({ enum: WeaponType, description: "Weapon type" })
  weaponType!: WeaponType;
}
