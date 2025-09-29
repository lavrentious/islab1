import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaginateParams, PaginateResponse } from "src/modules/common/types";
import { CreateHumanBeingDto, HumanBeing } from "./types";

export const labApi = createApi({
  reducerPath: "labApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? "") + "/lab",
  }),
  tagTypes: ["HumanBeing"],
  endpoints: (build) => ({
    findOneHumanBeing: build.query<HumanBeing, number>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "HumanBeing", id }],
    }),
    findAllHumanBeings: build.query<
      PaginateResponse<HumanBeing>,
      PaginateParams
    >({
      query: (params) => ({
        url: "/",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "HumanBeing" as const,
                id,
              })),
              { type: "HumanBeing", id: "LIST" },
            ]
          : [{ type: "HumanBeing", id: "LIST" }],
    }),
    createHumanBeing: build.mutation<HumanBeing, CreateHumanBeingDto>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "HumanBeing", id: "LIST" }],
    }),
    updateHumanBeing: build.mutation<
      HumanBeing,
      { id: number; dto: Partial<CreateHumanBeingDto> }
    >({
      query: ({ id, dto }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: dto,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "HumanBeing", id },
        { type: "HumanBeing", id: "LIST" },
      ],
    }),
  }),
});

export const { useFindAllHumanBeingsQuery, useCreateHumanBeingMutation } =
  labApi;
