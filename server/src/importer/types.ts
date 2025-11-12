import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";

export type ImporterProcessorPayload = {
  filePath: string;
  importOp: number;
};

export type ImportWorkerPayload = {
  filePath: string;
};

export type ImportWorkerResult = {
  validItems: CreateHumanBeingDto[];
  ok: boolean;
  error?: any;
  msg?: string;
};
