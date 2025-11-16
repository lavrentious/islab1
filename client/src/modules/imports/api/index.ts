import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { io, Socket } from "socket.io-client";
import { ImporterServerToClientEvents, ImportOperation } from "./types";

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
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const socket: Socket<ImporterServerToClientEvents> = io(
          (import.meta.env.VITE_API_BASE_URL ?? "") + "/imports",
        );

        try {
          await cacheDataLoaded;
          console.log("socket connected");

          socket.on("importStatusChanged", (event) => {
            updateCachedData((draft) => {
              const idx = draft.findIndex((op) => op.id === event.id);
              if (idx === -1) return;

              draft[idx] = {
                ...draft[idx],
                ...event,
                createdAt: event.createdAt ?? draft[idx].createdAt,
                startedAt: event.startedAt ?? draft[idx].startedAt,
                finishedAt: event.finishedAt ?? draft[idx].finishedAt,
              };
            });
          });
        } catch (e) {
          console.error("socket error:", e);
        }

        await cacheEntryRemoved;
        console.log("socket disconnected");
        socket.disconnect();
      },
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
