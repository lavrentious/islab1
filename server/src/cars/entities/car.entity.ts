import { Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { HumanBeing } from "../../humanbeings/entities/humanbeing.entity";

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

  @Property({ default: 0 })
  _version: number = 0; // TODO: add constraint (> 0)
}
