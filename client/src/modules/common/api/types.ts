export type GenericApiError = {
  status: number;
};

export type ValidationApiError = GenericApiError & {
  data: {
    error: string;
    message: string[];
    statusCode: number;
  };
};
