import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { ImportOperationDto } from "./dto/importoperation.dto";
import { ImportStatus } from "./entities/importoperation.entity";

export type ImporterProcessorPayload = {
  filePath: string;
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

export type ImporterProcessorResult =
  | {
      ok: true;

      validItems: CreateHumanBeingDto[];
    }
  | {
      ok: false;
      errorMessage?: string;
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

export function importOpDtoToPayload(
  importOp: Partial<ImportOperationDto> & { id: number },
): ImportOpSocketPayload {
  return {
    ...importOp,
  };
}

export interface ImporterServerToClientEvents {
  importStatusChanged: (payload: ImportOpSocketPayload) => void;
}
