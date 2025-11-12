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
  createdAt!: Date;
  startedAt?: Date;
  finishedAt?: Date;
  errorMessage?: string;
}
