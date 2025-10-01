import { ApiProperty } from "@nestjs/swagger";
import { Car } from "../entities/car.entity";

export class CarDto implements Partial<Car> {
  constructor(car: Car) {
    Object.assign(this, car);
  }

  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  cool!: boolean | null;
}
