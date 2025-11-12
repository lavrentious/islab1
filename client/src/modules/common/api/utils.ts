import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function formatApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "Unknown error.";

  if ("status" in error) {
    if (error.status === "FETCH_ERROR") {
      return "Connection error";
    }

    if (typeof error.status === "number") {
      const data = error.data as { message?: string; statusCode?: number };

      if (data?.message) {
        if (Array.isArray(data.message)) {
          return data.message.join("\n");
        }
        return data.message;
      }

      return `Error ${error.status}`;
    }
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Unknown error";
}
