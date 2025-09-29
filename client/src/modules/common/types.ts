export type Paths<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

export class PaginateParams {
  paginate?: boolean = false;
  page?: number;
  limit?: number;
}

export class PaginateResponse<T> {
  items!: T[];
  limit!: number;
  page!: number;
  totalItems!: number;
  totalPages!: number;
}
