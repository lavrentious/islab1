import { PaginateParams } from "src/modules/common/types";

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

class Coordinates {
  x!: number; // double
  y!: number; // int
}

class Car {
  name!: string; //Поле не может быть null
  cool?: boolean | null;
}

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

  id!: number;
  name!: string;
  coordinates!: Coordinates;
  creationDate!: Date;
  realHero!: boolean;
  hasToothpick?: boolean | null;
  car!: Car;
  mood!: Mood;
  impactSpeed?: number | null;
  soundtrackName!: string;
  minutesOfWaiting?: number | null;
  weaponType!: WeaponType;
}

export type CreateHumanBeingDto = Omit<HumanBeing, "id" | "creationDate">;

export class FindAllHumanbeingsQueryParamsDto extends PaginateParams {
  // filters
  name?: string;
  realHero?: boolean;
  hasToothpick?: boolean | null;
  mood?: Mood;
  carName?: string;
  carCool?: boolean | null;
  weaponType?: WeaponType;
  soundtrackName?: string;

  // sorting
  sortBy?: keyof HumanBeing;
  sortOrder?: "ASC" | "DESC";
}
