import { InjectRepository } from "@mikro-orm/nestjs";
import {
  EntityManager,
  EntityRepository,
  IsolationLevel,
} from "@mikro-orm/postgresql";
import { InjectQueue } from "@nestjs/bull";
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Queue } from "bull";
import * as crypto from "crypto";
import * as fs from "fs";
import objectHash from "object-hash";
import * as path from "path";
import { CreateCarDto } from "src/cars/dto/create-car.dto";
import { Car } from "src/cars/entities/car.entity";
import { EnvironmentVariables } from "src/env.validation";
import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { HumanBeing } from "src/humanbeings/entities/humanbeing.entity";
import { retryTransaction } from "src/humanbeings/utils";
import { v7 as generateUuid } from "uuid";
import { Worker } from "worker_threads";
import { ImportOperationDto } from "./dto/importoperation.dto";
import {
  ImportOperation,
  ImportStatus,
} from "./entities/importoperation.entity";
import { ImporterGateway } from "./importer.gateway";
import { getAllowedFileExtensions } from "./parsers";
import { ImportFileStorageService } from "./storage/import-file-storage.service";
import {
  ImporterProcessorPayload,
  ImporterProcessorResult,
  importOpDtoToPayload,
  ImportWorkerPayload,
  ImportWorkerResult,
} from "./types";

function log(msg: string, ...meta: any[]) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`, ...meta); // eslint-disable-line
}

const BATCH_SIZE = 1000;

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
    private readonly gateway: ImporterGateway,
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
    const importOp = await this.findOneOrFail(id);
    if (importOp.status !== ImportStatus.SUCCESS) {
      throw new BadRequestException(
        `Import operation #${id} cannot be downloaded. Status: ${importOp.status} (must be ${ImportStatus.SUCCESS})`,
      );
    }
    return this.storage.getDownloadUrl(importOp.fileName);
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

    // create import operation
    const importOp = this.repo.create({
      fileName: fileName,
      status: ImportStatus.PENDING,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(importOp);

    const importer = new Importer(
      this.importQueue,
      importOp,
      this.repo,
      this.em,
      this.configService.get("TMP_DIR")!,
      file,
      fileName,
      (data) => this.gateway.notifyStatusChange(importOpDtoToPayload(data)),
    );
    const s3Uploader = new S3Uploader(
      this.storage,
      fileName,
      file.buffer,
      file.mimetype,
    );
    // const breaker = new BusinessLogicBreaker();
    log(`service: running 2pc`);
    void this.run2PC([
      {
        prepare: () => s3Uploader.prepare(),
        commit: () => s3Uploader.commit(),
        rollback: () => s3Uploader.rollback(),
        name: "s3 uploader",
      },
      // {
      //   prepare: () => breaker.prepare(),
      //   commit: () => breaker.commit(),
      //   rollback: () => breaker.rollback(),
      //   name: "breaker",
      // },
      {
        prepare: () => importer.prepare(),
        commit: () => importer.commit(),
        rollback: () => importer.rollback(),
        name: "importer",
      },
    ]).catch(async (e) => {
      if (importOp.status === ImportStatus.PENDING) {
        await importer.setImportOpFailed(
          e instanceof HttpException ? e.message : "Internal error",
        );
      }
    });

    log(`service: returning`);
    return importOp;
  }

  async run2PC(
    resources: Array<{
      prepare: () => Promise<void> | void;
      commit: () => Promise<void> | void;
      rollback: () => Promise<void> | void;
      name?: string;
    }>,
  ) {
    const prepared: typeof resources = [];

    try {
      for (const r of resources) {
        try {
          log(`preparing ${r.name}...`);
          await r.prepare();
          prepared.push(r);
          log(`prepared ${r.name}`);
        } catch (err) {
          try {
            log(`error at prepare, rolling back ${r.name}...`);
            await r.rollback();
            log(`rolled back ${r.name}`);
          } catch (rollbackErr) {
            console.error(
              `rollback failed for partially prepared ${r.name}:`,
              rollbackErr,
            );
          }
          throw err;
        }
      }

      for (const r of prepared) {
        await r.commit();
      }
    } catch (err) {
      for (const r of [...prepared].reverse()) {
        try {
          log(`rolling back ${r.name}...`);
          await r.rollback();
          log(`rolled back ${r.name}`);
        } catch (rollbackErr) {
          console.error(`rollback failed for ${r.name}:`, rollbackErr);
        }
      }
      throw err;
    }
  }
}

// class BusinessLogicBreaker {
//   prepare() {
//     console.log("simulating server-side business logic exception...");
//     throw new Error("Simulated business logic failure");
//   }

//   commit() {}
//   rollback() {
//     console.log("rollback for BusinessLogicBreaker (no-op)");
//   }
// }

export class S3Uploader {
  constructor(
    private readonly storage: ImportFileStorageService,
    private readonly key: string,
    private readonly body: Buffer,
    private readonly contentType: string,
  ) {}

  async prepare() {
    log(`uploading ${this.key}...`);
    await this.storage.uploadFile(this.key, this.body, this.contentType);
  }

  commit() {
    log(`committing ${this.key} (no-op)`);
  }

  async rollback() {
    log(`rolling back ${this.key}...`);
    await this.storage.deleteFile(this.key);
  }
}

export class Importer {
  private filePath: string;
  private tx: EntityManager | null = null;
  private parsedObjects: CreateHumanBeingDto[] = [];

  // optimization structures
  private uniqueCarIds: number[] = [];
  private carDtoMap: Map<string, CreateCarDto> = new Map();
  private humanNames: Set<string> = new Set();
  private result: { okCount: number; duplicateCount: number } | null = null;
  private errorMessage: string | null = null;

  constructor(
    private readonly importQueue: Queue<ImporterProcessorPayload>,
    private readonly importOp: ImportOperation,
    private readonly repo: EntityRepository<ImportOperation>,
    private readonly em: EntityManager,
    private readonly tmpDir: string,
    private readonly file: Express.Multer.File,
    private readonly fileName: string,
    private readonly onProgress: (
      data: Partial<ImportOperationDto> & { id: number },
    ) => Promise<void> | void,
  ) {}

  async prepare(): Promise<void> {
    // hash check
    const hash = crypto
      .createHash("sha256")
      .update(this.file.buffer)
      .digest("hex");
    const existing = await this.repo.count({
      fileHash: hash,
      status: { $ne: ImportStatus.FAILED },
    });
    if (existing > 0) {
      throw new BadRequestException(
        `This file has already been imported or is already in progress (hash: ${hash})`,
      );
    }
    this.importOp.fileHash = hash;
    await this.em.persistAndFlush(this.importOp);

    // save temp file
    const tempDir = path.join(this.tmpDir, "/uploads");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    this.filePath = path.join(tempDir, this.fileName);
    fs.writeFileSync(this.filePath, this.file.buffer);

    log(`queued file parsing and validation...`);
    const job = await this.importQueue.add("parse-file", {
      filePath: this.filePath,
    } satisfies ImporterProcessorPayload);
    const parseJobResult = (await job.finished()) as ImporterProcessorResult;
    log(`parsing job finished: ${parseJobResult.ok}`);

    if (!parseJobResult.ok) {
      log(`parsing job failed: ${parseJobResult.errorMessage}`);
      this.errorMessage = parseJobResult.errorMessage ?? null;
      await this.setImportOpFailed(parseJobResult.errorMessage);
      throw new BadRequestException(this.errorMessage);
    }
    log(`parsed objects count: ${parseJobResult.validItems.length}`);

    this.parsedObjects = parseJobResult.validItems;

    // initialize optimization structures
    this.uniqueCarIds = Array.from(
      new Set(
        this.parsedObjects
          .filter((dto) => dto.car != null && typeof dto.car === "number")
          .map((dto) => dto.car as number),
      ),
    );
    log(`Unique numeric car IDs: count=${this.uniqueCarIds.length}`);

    this.carDtoMap = new Map<string, CreateCarDto>();
    for (const dto of this.parsedObjects) {
      if (dto.car && typeof dto.car === "object") {
        const hash = this._hashCar(dto.car);
        this.carDtoMap.set(hash, dto.car);
      }
    }
    log(`Unique car DTOs: count=${this.carDtoMap.size}`);

    this.humanNames = new Set<string>(
      this.parsedObjects.map((dto) => dto.name),
    );
    log(`Unique human names: count=${this.humanNames.size}`);

    return retryTransaction(async () => {
      await this.beginTransaction();
      return this.importEntities(this.tx!, this.parsedObjects).catch((e) => {
        if (e instanceof HttpException) {
          this.errorMessage = e.message;
          void this.setImportOpFailed(e.message);
        }
        throw e;
      });
    });
  }

  async beginTransaction() {
    log(`beginning transaction`);
    this.tx = this.em.fork();
    await this.tx.begin({ isolationLevel: IsolationLevel.SERIALIZABLE });
    await this.setImportOpStarted(this.parsedObjects.length);
  }

  async commit() {
    log(`committing transaction`);
    if (!this.tx) throw new Error("Transaction not started");
    await this.tx.commit();
    this.tx = null;
    if (this.result) {
      await this.setImportOpSuccess(
        this.result.okCount,
        this.result.duplicateCount,
      );
    }
    fs.unlinkSync(this.filePath);
  }

  async rollback() {
    log(`rolling back transaction`);
    if (!this.tx) return;
    await this.tx.rollback();
    this.tx = null;
    await this.setImportOpFailed(this.errorMessage ?? undefined);
    fs.unlinkSync(this.filePath);
  }

  private async importEntities(
    tx: EntityManager,
    parsedObjects: CreateHumanBeingDto[],
  ) {
    log("transaction started");

    const invalidCars = await this._getInvalidCarIds(this.uniqueCarIds, tx);
    if (invalidCars.length > 0) {
      throw new BadRequestException(`Invalid cars: ${invalidCars.join(", ")}`);
    }

    const takenCarNames = await this._getTakenCarNames(
      Array.from(this.carDtoMap.values()),
      tx,
    );
    if (takenCarNames.length > 0) {
      throw new BadRequestException(
        `Car name must be unique - unavailable car names: ${takenCarNames
          .map((n) => `"${n}"`)
          .join(", ")}`,
      );
    }

    // create cars as dtos
    const carMap = new Map<string, Car>(); // hash dto -> car entity
    for (const [hash, dto] of this.carDtoMap.entries()) {
      const car = tx.create(Car, dto as Omit<Car, "id">);
      carMap.set(hash, car);
    }

    const carEntities = Array.from(carMap.values());
    if (carEntities.length > 0) {
      log(`Persisting cars in chunks of ${BATCH_SIZE}`);
      for (let i = 0; i < carEntities.length; i += BATCH_SIZE) {
        const chunk = carEntities.slice(i, i + BATCH_SIZE);
        tx.persist(chunk);
        await tx.flush();
      }
    }

    const fromDB: HumanBeing[] = this.humanNames.size
      ? await tx.find(HumanBeing, {
          name: { $in: [...this.humanNames] },
          _next_version: null,
        })
      : [];

    const hbMap = new Map<string, HumanBeing>(
      fromDB.map((human) => [human.name, human]),
    );

    let okCount = 0;
    let duplicateCount = 0;

    const chunkBuffer: HumanBeing[] = [];
    const flushChunk = async (force = false) => {
      if (chunkBuffer.length === 0 && !force) return;
      tx.persist(chunkBuffer);
      await tx.flush();

      tx.clear();
      chunkBuffer.length = 0;
    };

    log("Beginning entity import loop (chunked)...");
    for (const dto of parsedObjects) {
      const existing = hbMap.get(dto.name);

      let carEntity: Car | undefined;
      if (dto.car && typeof dto.car === "object") {
        const hash = this._hashCar(dto.car);
        const cachedCar = carMap.get(hash);
        if (cachedCar && cachedCar.id) {
          carEntity = tx.getReference(Car, cachedCar.id);
        } else if (cachedCar) {
          carEntity = cachedCar;
        } else {
          carEntity = undefined;
        }
      } else if (dto.car && typeof dto.car === "number") {
        carEntity = tx.getReference(Car, dto.car);
      }

      if (existing) {
        duplicateCount++;
        const humanBeing = tx.create(HumanBeing, {
          ...dto,
          car: carEntity,
          _version: existing._version + 1,
          _version_root: existing._version_root
            ? existing._version_root
            : existing,
          creationDate: new Date(),
        });
        existing._next_version = humanBeing;

        chunkBuffer.push(humanBeing, existing);
        hbMap.set(dto.name, humanBeing);
      } else {
        okCount++;
        const humanBeing = tx.create(HumanBeing, {
          ...dto,
          car: carEntity,
          _version: 0,
          creationDate: new Date(),
        });
        chunkBuffer.push(humanBeing);
        hbMap.set(dto.name, humanBeing);
      }

      if (chunkBuffer.length >= BATCH_SIZE) {
        await flushChunk();
        for (const [hash, car] of carMap.entries()) {
          if (car.id) {
            carMap.set(hash, tx.getReference(Car, car.id) as unknown as Car);
          }
        }
      }
    }

    await flushChunk(true);

    log(
      `--- db import result: created=${okCount}, duplicates=${duplicateCount}`,
    );
    this.result = {
      okCount,
      duplicateCount,
    };
  }

  private async runParsingWorker(
    filePath: string,
  ): Promise<ImportWorkerResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "generic.worker.js"), {
        workerData: {
          filePath,
        } satisfies ImportWorkerPayload,
      });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(
            new InternalServerErrorException(`Worker exited with code ${code}`),
          );
      });
    });
  }

  // import operation status helpers
  // TODO: add WS events
  async setImportOpStarted(entryCount: number) {
    this.importOp.startedAt = new Date();
    this.importOp.status = ImportStatus.IN_PROGRESS;
    this.importOp.entryCount = entryCount;
    await this.em.persistAndFlush(this.importOp);
    void this.onProgress({
      id: this.importOp.id,
      startedAt: this.importOp.startedAt.toISOString(),
      status: ImportStatus.IN_PROGRESS,
      entryCount,
    });
  }

  async setImportOpSuccess(okCount: number, duplicateCount: number) {
    this.importOp.finishedAt = new Date();
    this.importOp.status = ImportStatus.SUCCESS;
    this.importOp.okCount = okCount;
    this.importOp.duplicateCount = duplicateCount;
    await this.em.persistAndFlush(this.importOp);
    void this.onProgress({
      id: this.importOp.id,
      finishedAt: this.importOp.finishedAt.toISOString(),
      status: ImportStatus.SUCCESS,
      okCount,
      duplicateCount,
    });
  }

  async setImportOpFailed(error?: string) {
    this.importOp.finishedAt = new Date();
    this.importOp.status = ImportStatus.FAILED;
    this.importOp.errorMessage = error;
    await this.em.persistAndFlush(this.importOp);
    void this.onProgress({
      id: this.importOp.id,
      finishedAt: this.importOp.finishedAt.toISOString(),
      status: ImportStatus.FAILED,
      errorMessage: error,
    });
  }

  /**
   * check that provided car ids exist
   * @param dtos
   * @param _em
   * @returns
   */
  async _getInvalidCarIds(
    ids: number[],
    _em?: EntityManager,
  ): Promise<number[]> {
    if (ids.length === 0) return [];
    const em: EntityManager = _em || this.em.fork();
    const existingCars = await em.find(Car, { id: { $in: ids } });
    const validCarIds = new Set(existingCars.map((car) => car.id));
    const invalidCarIds = ids.filter((id) => !validCarIds.has(id));
    return invalidCarIds;
  }

  /**
   * check all car dtos are valid - names available (because names are unique)
   * @param dtos
   * @param _em
   * @returns
   */
  async _getTakenCarNames(
    dtos: CreateCarDto[],
    _em?: EntityManager,
  ): Promise<string[]> {
    const uniqueCarNames = Array.from(new Set(dtos.map((dto) => dto.name)));
    if (uniqueCarNames.length === 0) return [];
    const em: EntityManager = _em || this.em.fork();
    const existingCars = await em.find(Car, { name: { $in: uniqueCarNames } });
    const takenCarNames = existingCars.map((car) => car.name);
    return takenCarNames;
  }

  private _hashCar(dto: CreateCarDto) {
    return objectHash(dto);
  }
}
