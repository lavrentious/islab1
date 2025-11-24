import { ApiProperty } from "@nestjs/swagger";

export class CarDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  cool!: boolean | null;
}
