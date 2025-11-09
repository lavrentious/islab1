export enum ImportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class ImportOperation {
  id!: number;
  fileName!: string; // file name in ./<TMP_DIR>/uploads
  status!: ImportStatus;
  okCount?: number;
  failedCount?: number;
  duplicateCount?: number;
  createdAt!: Date;
  finishedAt?: Date;
  errorMessage?: string;
}
