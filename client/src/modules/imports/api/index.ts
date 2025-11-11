// api/imports.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ImportOperation } from "./types";

export const importsApi = createApi({
  reducerPath: "importsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL ?? "") + "/imports",
  }),
  tagTypes: ["ImportOperation", "HumanBeing"],
  endpoints: (build) => ({
    findOneImportOp: build.query<ImportOperation, number>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "ImportOperation", id }],
    }),

    findAllImportOps: build.query<ImportOperation[], void>({
      query: () => "/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ImportOperation" as const,
                id,
              })),
              { type: "ImportOperation", id: "LIST" },
            ]
          : [{ type: "ImportOperation", id: "LIST" }],
    }),

    uploadImportFile: build.mutation<ImportOperation, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "ImportOperation", id: "LIST" },
        { type: "HumanBeing", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useFindAllImportOpsQuery,
  useFindOneImportOpQuery,
  useUploadImportFileMutation,
} = importsApi;
