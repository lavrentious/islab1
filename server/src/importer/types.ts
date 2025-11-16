import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { ImportStatus } from "./entities/importoperation.entity";

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

// sockets
export interface ImportOpSocketPayload {
  id: number;
  status?: ImportStatus;
  createdAt?: string; // ISO
  startedAt?: string; // ISO
  finishedAt?: string; // ISO
  okCount?: number;
  duplicateCount?: number;
  entryCount?: number;
  errorMessage?: string;
}

export interface ImporterServerToClientEvents {
  importStatusChanged: (payload: ImportOpSocketPayload) => void;
}
