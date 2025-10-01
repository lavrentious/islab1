import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaginateResponse } from "src/modules/common/types";
import {
  Car,
  CreateCarDto,
  FindAllCarsQueryParamsDto,
  UpdateCarDto,
} from "./types";

export const carsApi = createApi({
  reducerPath: "carsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? "") + "/cars",
  }),
  tagTypes: ["Car"],
  endpoints: (build) => ({
    findOneCar: build.query<Car, number>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "Car", id }],
    }),
    findAllCars: build.query<PaginateResponse<Car>, FindAllCarsQueryParamsDto>({
      query: (params) => ({
        url: "/",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Car" as const,
                id,
              })),
              { type: "Car", id: "LIST" },
            ]
          : [{ type: "Car", id: "LIST" }],
    }),
    createCar: build.mutation<Car, CreateCarDto>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Car", id: "LIST" }],
    }),
    updateCar: build.mutation<Car, { id: number; dto: UpdateCarDto }>({
      query: ({ id, dto }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: dto,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Car", id },
        { type: "Car", id: "LIST" },
      ],
    }),
    deleteCar: build.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Car", id },
        { type: "Car", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFindOneCarQuery,
  useFindAllCarsQuery,
  useCreateCarMutation,
  useDeleteCarMutation,
  useUpdateCarMutation,
} = carsApi;
