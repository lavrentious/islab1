import {
  Embeddable,
  Embedded,
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Car } from "../../cars/entities/car.entity";

export enum Mood {
  SADNESS = "SADNESS",
  SORROW = "SORROW",
  LONGING = "LONGING",
  APATHY = "APATHY",
  CALM = "CALM",
}

export enum WeaponType {
  HAMMER = "HAMMER",
  SHOTGUN = "SHOTGUN",
  RIFLE = "RIFLE",
}

@Embeddable()
class Coordinates {
  @Property({ columnType: "double precision" })
  x!: number; // double

  @Property({ columnType: "integer" })
  y!: number; // int
}

@Entity()
export class HumanBeing {
  // private Long id; //Поле не может быть null, Значение поля должно быть больше 0, Значение этого поля должно быть уникальным, Значение этого поля должно генерироваться автоматически
  // private String name; //Поле не может быть null, Строка не может быть пустой
  // private Coordinates coordinates; //Поле не может быть null
  // private java.time.LocalDateTime creationDate; //Поле не может быть null, Значение этого поля должно генерироваться автоматически
  // private boolean realHero;
  // private Boolean hasToothpick; //Поле может быть null
  // private Car car; //Поле не может быть null
  // private Mood mood; //Поле не может быть null
  // private long impactSpeed;
  // private String soundtrackName; //Поле не может быть null
  // private Integer minutesOfWaiting; //Поле может быть null
  // private WeaponType weaponType; //Поле не может быть null
  @PrimaryKey()
  id!: number;

  @Index()
  @Property()
  name!: string;

  @Embedded(() => Coordinates)
  coordinates!: Coordinates;

  @Property({ onCreate: () => new Date() })
  creationDate!: Date;

  @Property({ columnType: "boolean" })
  realHero!: boolean;

  @Property({ nullable: true, columnType: "boolean" })
  hasToothpick: boolean | null = null;

  @ManyToOne({ entity: () => Car, nullable: true })
  car: Car | null = null;

  @Enum({ items: () => Mood, type: "string" })
  mood!: Mood;

  @Property({ columnType: "integer", nullable: true })
  impactSpeed: number | null = null;

  @Property()
  soundtrackName!: string;

  @Property({ columnType: "integer", nullable: true })
  minutesOfWaiting: number | null = null;

  @Enum({ items: () => WeaponType, type: "string" })
  weaponType!: WeaponType;

  // duplicate is defined by `name`
  @Property({ default: 0 })
  _version: number = 0; // TODO: add constraint (> 0)

  @ManyToOne(() => HumanBeing, { nullable: true, default: null })
  _next_version?: HumanBeing; // next version - child

  // root parent, just to not traverse the whole tree every time
  @ManyToOne(() => HumanBeing, { nullable: true, default: null })
  _version_root?: HumanBeing;
}
