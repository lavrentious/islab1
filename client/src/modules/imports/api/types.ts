export enum ImportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class ImportOperation {
  id!: number;
  fileHash?: string;
  fileName!: string; // file name in ./<TMP_DIR>/uploads
  status!: ImportStatus;
  entryCount?: number;
  okCount?: number;
  duplicateCount?: number;
  createdAt!: string;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
}

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

// export interface ImporterClientToServerEvents {}
