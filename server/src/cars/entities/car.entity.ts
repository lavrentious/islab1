import { Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { HumanBeing } from "../../humanbeings/entities/humanbeing.entity";
import { CarDto } from "../dto/car.dto";

@Entity()
export class Car {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  name!: string; //Поле не может быть null

  @Property({ nullable: true, columnType: "boolean" })
  cool!: boolean | null;

  @OneToMany(() => HumanBeing, (human) => human.car)
  owners: HumanBeing[];

  toDto(): CarDto {
    return {
      id: this.id,
      name: this.name,
      cool: this.cool,
    };
  }
}
