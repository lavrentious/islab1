import { PaginateParams } from "src/modules/common/types";

export class Car {
  id!: number;
  name!: string;
  cool!: boolean | null;
}

export class CreateCarDto {
  name!: string;
  cool?: boolean | null;
}

export type UpdateCarDto = Partial<CreateCarDto>;

export class FindAllCarsQueryParamsDto extends PaginateParams {
  name?: string;
  cool?: boolean | null;

  sortBy?: "id" | "name" | "cool";
  sortOrder?: "ASC" | "DESC";
}
