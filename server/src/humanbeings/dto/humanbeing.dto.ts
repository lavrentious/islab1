import { ApiProperty } from "@nestjs/swagger";
import { Mood, WeaponType } from "../entities/humanbeing.entity";
import { CoordinatesDto } from "./create-humanbeing.dto";

export class HumanBeingDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: "Nikita", description: "Human name, must be unique" })
  name!: string;

  @ApiProperty()
  creationDate!: string;

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

  @ApiProperty({ example: 0, description: "Version", minimum: 0 })
  _version!: number;

  @ApiProperty({ example: 1, description: "Next version ID", nullable: true })
  _next_version!: number | null;

  @ApiProperty({
    example: 1,
    description: "Root version ID",
    nullable: true,
  })
  _version_root!: number | null;

  static equals(
    hb1: HumanBeingDto | null | undefined,
    hb2: HumanBeingDto | null | undefined,
  ): boolean {
    if (!hb1 || !hb2) {
      return false;
    }

    // console.log("id", hb1.id === hb2.id);
    // console.log("name", hb1.name === hb2.name);
    // console.log("creationDate", hb1.creationDate === hb2.creationDate);
    // console.log("coordinates.x", hb1.coordinates.x === hb2.coordinates.x);
    // console.log("coordinates.y", hb1.coordinates.y === hb2.coordinates.y);
    // console.log("realHero", hb1.realHero === hb2.realHero);
    // console.log("hasToothpick", hb1.hasToothpick === hb2.hasToothpick);
    // console.log("car", hb1.car?.id === hb2.car?.id);
    // console.log("mood", hb1.mood === hb2.mood);
    // console.log("impactSpeed", hb1.impactSpeed === hb2.impactSpeed);
    // console.log("soundtrackName", hb1.soundtrackName === hb2.soundtrackName);
    // console.log(
    //   "minutesOfWaiting",
    //   hb1.minutesOfWaiting === hb2.minutesOfWaiting,
    // );
    // console.log("weaponType", hb1.weaponType === hb2.weaponType);

    return (
      hb1.id === hb2.id &&
      hb1.name === hb2.name &&
      hb1.creationDate === hb2.creationDate &&
      hb1.coordinates.x === hb2.coordinates.x &&
      hb1.coordinates.y === hb2.coordinates.y &&
      hb1.realHero === hb2.realHero &&
      hb1.hasToothpick === hb2.hasToothpick &&
      hb1.car === hb2.car &&
      hb1.mood === hb2.mood &&
      hb1.impactSpeed === hb2.impactSpeed &&
      hb1.soundtrackName === hb2.soundtrackName &&
      hb1.minutesOfWaiting === hb2.minutesOfWaiting &&
      hb1.weaponType === hb2.weaponType
    );
  }
}
