import { FindAllOptions } from "@mikro-orm/core";
import { PaginateParams } from "../dto/pagination.dto";

export function calculateTotalPages(totalItems: number, limit: number): number {
  if (limit >= totalItems) {
    return 1;
  }
  return Math.ceil(totalItems / limit);
}

export function paginateParamsToQuery<T>(
  params: PaginateParams,
): (FindAllOptions<T> & { limit: number; offset: number }) | null {
  if (!(params.paginate && params.page && params.limit)) {
    return null;
  }
  return {
    offset: (params.page - 1) * params.limit,
    limit: params.limit,
  };
}
