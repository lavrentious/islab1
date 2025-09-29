import {
  Embeddable,
  Embedded,
  Entity,
  Enum,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

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

@Embeddable()
class Car {
  @Property()
  name!: string; //Поле не может быть null

  @Property({ nullable: true, columnType: "boolean" })
  cool?: boolean | null;
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

  @Property()
  name!: string;

  @Embedded(() => Coordinates)
  coordinates!: Coordinates;

  @Property({ onCreate: () => new Date() })
  creationDate!: Date;

  @Property({ columnType: "boolean" })
  realHero!: boolean;

  @Property({ nullable: true, columnType: "boolean" })
  hasToothpick?: boolean | null;

  @Embedded(() => Car)
  car!: Car;

  @Enum({ items: () => Mood, type: "string" })
  mood!: Mood;

  @Property({ columnType: "integer", nullable: true })
  impactSpeed?: number | null;

  @Property()
  soundtrackName!: string;

  @Property({ columnType: "integer", nullable: true })
  minutesOfWaiting?: number | null;

  @Enum({ items: () => WeaponType, type: "string" })
  weaponType!: WeaponType;
}
