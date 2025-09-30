import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PaginateResponse } from "src/modules/common/types";
import {
  CreateHumanBeingDto,
  FindAllHumanbeingsQueryParamsDto,
  HumanBeing,
} from "./types";

export const humanBeingsApi = createApi({
  reducerPath: "humanBeingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? "") + "/humanbeings",
  }),
  tagTypes: ["HumanBeing"],
  endpoints: (build) => ({
    findOneHumanBeing: build.query<HumanBeing, number>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "HumanBeing", id }],
    }),
    findAllHumanBeings: build.query<
      PaginateResponse<HumanBeing>,
      FindAllHumanbeingsQueryParamsDto
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
    deleteHumanBeing: build.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "HumanBeing", id },
        { type: "HumanBeing", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFindAllHumanBeingsQuery,
  useCreateHumanBeingMutation,
  useDeleteHumanBeingMutation,
  useUpdateHumanBeingMutation,
} = humanBeingsApi;
