import { IsNumber, IsPositive } from "class-validator";

export class IncrementMinutesOfWaitingDto {
  @IsNumber()
  id: number;

  @IsPositive()
  @IsNumber()
  value: number;
}
