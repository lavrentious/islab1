import { Entity, PrimaryKey } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import {
  ImportOperation,
  ImportStatus,
} from "../entities/importoperation.entity";

@Entity()
export class ImportOperationDto {
  constructor(importOp: ImportOperation) {
    Object.assign(this, importOp);
  }

  @PrimaryKey()
  id!: number;

  @ApiProperty()
  fileName!: string; // file name in ./<TMP_DIR>/uploads

  @ApiProperty({ enum: ImportStatus })
  status!: ImportStatus;

  @ApiProperty()
  entryCount?: number;

  @ApiProperty()
  okCount?: number;

  @ApiProperty()
  failedCount?: number;

  @ApiProperty()
  duplicateCount?: number;

  @ApiProperty()
  createdAt: Date = new Date();

  @ApiProperty()
  finishedAt?: Date;

  @ApiProperty()
  errorMessage?: string;
}
