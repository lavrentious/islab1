import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { InjectQueue } from "@nestjs/bull";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Queue } from "bull";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { EnvironmentVariables } from "src/env.validation";
import { v7 as generateUuid } from "uuid";
import { ImportOperationDto } from "./dto/importoperation.dto";
import {
  ImportOperation,
  ImportStatus,
} from "./entities/importoperation.entity";
import { getAllowedFileExtensions } from "./parsers";
import { ImportFileStorageService } from "./storage/import-file-storage.service";
import { ImporterProcessorPayload } from "./types";

@Injectable()
export class ImporterService {
  constructor(
    @Inject()
    private readonly configService: ConfigService<EnvironmentVariables>,
    @InjectQueue("import-queue")
    private readonly importQueue: Queue<ImporterProcessorPayload>,
    private readonly em: EntityManager,
    @InjectRepository(ImportOperation)
    private readonly repo: EntityRepository<ImportOperation>,
    private readonly storage: ImportFileStorageService,
  ) {}

  async findOne(id: number): Promise<ImportOperationDto | null> {
    const entity = await this.repo.findOne({ id });
    return entity ? new ImportOperationDto(entity) : null;
  }

  async findOneOrFail(id: number): Promise<ImportOperationDto> {
    const entity = await this.repo.findOneOrFail(
      { id },
      {
        failHandler: () =>
          new NotFoundException(`Import operation #${id} not found`),
      },
    );
    return new ImportOperationDto(entity);
  }

  async getDownloadUrl(id: number) {
    const entity = await this.findOneOrFail(id);
    return this.storage.getDownloadUrl(entity.fileName);
  }

  async findAll(): Promise<ImportOperationDto[]> {
    const entities = await this.repo.findAll({
      orderBy: { createdAt: "DESC" },
    });
    return entities.map((entity) => new ImportOperationDto(entity));
  }

  async enqueueImport(file: Express.Multer.File) {
    // validate file
    const ext = path.extname(file.originalname).slice(1);
    const allowedFileExtensions = getAllowedFileExtensions();
    if (!allowedFileExtensions.includes(ext.toLowerCase())) {
      throw new BadRequestException(
        `Unsupported file type: ${ext}. Only ${allowedFileExtensions.join(", ")} files are allowed`,
      );
    }

    // save file in temp dir
    const fileName = generateUuid() + "." + ext;

    // get file hash
    const hash = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const existing = await this.repo.count({
      fileHash: hash,
      status: { $ne: ImportStatus.FAILED },
    });
    if (existing > 0) {
      throw new BadRequestException(
        `File with hash "${hash}" can't be imported (not failed)`,
      );
    }

    // upload to s3
    await this.storage.uploadFile(fileName, file.buffer, file.mimetype);

    // create job & enqueue
    const importOp = this.repo.create({
      fileName,
      fileHash: hash,
      status: ImportStatus.PENDING,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(importOp);

    // save file temporarily
    const tempDir = path.join(this.configService.get("TMP_DIR")!, "/uploads");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const job = await this.importQueue.add("import-file", {
      filePath,
      importOp: importOp.id,
    });

    void job.finished().finally(() => {
      console.log(
        `job for ${job.data.filePath} finished, deleting ${filePath}`,
      );
      try {
        fs.unlinkSync(filePath);
      } catch {
        /* empty */
      }
    });

    return importOp;
  }
}
