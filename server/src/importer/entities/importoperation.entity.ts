import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { ImportOperationDto } from "../dto/importoperation.dto";

export enum ImportStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity()
export class ImportOperation {
  @PrimaryKey()
  id!: number;

  @Property()
  fileName!: string; // file name in ./<TMP_DIR>/uploads

  @Property({ nullable: true })
  fileHash?: string;

  @Enum({ items: () => ImportStatus, type: "string" })
  status!: ImportStatus;

  @Property({ nullable: true })
  entryCount?: number; // valid parsed entries in file

  @Property({ nullable: true })
  okCount?: number;

  @Property({ nullable: true })
  duplicateCount?: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  finishedAt?: Date;

  @Property({ nullable: true })
  errorMessage?: string;

  toDto(): ImportOperationDto {
    return {
      id: this.id,
      fileName: this.fileName,
      status: this.status,
      entryCount: this.entryCount,
      okCount: this.okCount,
      duplicateCount: this.duplicateCount,
      createdAt: this.createdAt.toISOString(),
      startedAt: this.startedAt?.toISOString(),
      finishedAt: this.finishedAt?.toISOString(),
      errorMessage: this.errorMessage,
    };
  }
}
