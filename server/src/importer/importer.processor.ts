import {
  DriverException,
  EntityManager,
  IsolationLevel,
  MikroORM,
} from "@mikro-orm/postgresql";
import { Process, Processor } from "@nestjs/bull";
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { type Job } from "bull";
import objectHash from "object-hash";
import * as path from "path";
import { CreateCarDto } from "src/cars/dto/create-car.dto";
import { Car } from "src/cars/entities/car.entity";
import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { HumanBeing } from "src/humanbeings/entities/humanbeing.entity";
import { retryTransaction } from "src/humanbeings/utils";
import { Worker } from "worker_threads";
import {
  ImportOperation,
  ImportStatus,
} from "./entities/importoperation.entity";
import { ImporterGateway } from "./importer.gateway";
import {
  ImporterProcessorPayload,
  ImportWorkerPayload,
  ImportWorkerResult,
} from "./types";

@Processor("import-queue")
export class ImporterProcessor {
  constructor(
    private readonly orm: MikroORM,
    private readonly gateway: ImporterGateway,
  ) {}

  @Process({ name: "import-file", concurrency: 2 }) // concurrency: 13
  async importFile(job: Job<ImporterProcessorPayload>) {
    const em = this.orm.em.fork();
    const importOp = await em.findOne(ImportOperation, {
      id: job.data.importOp,
    });
    if (!importOp) {
      throw new InternalServerErrorException("importOp not found");
    }
    importOp.status = ImportStatus.IN_PROGRESS;
    importOp.startedAt = new Date();
    await em.persistAndFlush(importOp);
    this.gateway.notifyStatusChange({
      id: importOp.id,
      status: importOp.status,
      startedAt: importOp.startedAt.toISOString(),
    });

    // parse
    console.log("processor: running worker...");
    const data = (await this.runWorker(
      job.data.filePath,
    )) as ImportWorkerResult;
    console.log(
      `processor: received data from worker: ${data.validItems.length} items`,
    );
    console.log(`processor: msg="${data.msg}"`);

    // save
    importOp.entryCount = data.validItems.length;
    await em.persistAndFlush(importOp);
    this.gateway.notifyStatusChange({
      id: importOp.id,
      entryCount: importOp.entryCount,
    });
    if (!data.error && data.ok) {
      try {
        const res = await this.saveToDatabase(data.validItems);

        importOp.status = ImportStatus.SUCCESS;
        importOp.okCount = res.okCount;
        importOp.duplicateCount = res.duplicateCount;
      } catch (e) {
        importOp.status = ImportStatus.FAILED;
        if (e instanceof DriverException) {
          console.error("processor: error saving to db", e);
          importOp.errorMessage = "internal error (db)";
        } else if (e instanceof HttpException) {
          console.error("processor: error saving to db (http)", e);
          importOp.errorMessage = e.message;
        } else if (e instanceof Error) {
          console.error("processor: UNKNOWN ERROR", e);
          importOp.errorMessage = e.message;
        }
      } finally {
        importOp.finishedAt = new Date();
        await em.persistAndFlush(importOp);
      }
    } else {
      importOp.status = ImportStatus.FAILED;
      importOp.finishedAt = new Date();

      if (data.validItems.length == 0) {
        importOp.errorMessage = "no valid items";
      } else if (data.msg) {
        importOp.errorMessage = data.msg;
      }
      await em.persistAndFlush(importOp);
    }
    this.gateway.notifyStatusChange({
      id: importOp.id,
      status: importOp.status,
      startedAt: importOp.startedAt.toISOString(),
      finishedAt: importOp.finishedAt.toISOString(),
      okCount: importOp.okCount,
      duplicateCount: importOp.duplicateCount,
      errorMessage: importOp.errorMessage,
    });
  }

  private runWorker(filePath: string) {
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

  private _hashCar(dto: CreateCarDto) {
    return objectHash(dto);
  }

  private async saveToDatabase(parsedObjects: CreateHumanBeingDto[]): Promise<{
    okCount: number;
    duplicateCount: number;
  }> {
    const uniqueCarIds = Array.from(
      new Set(
        parsedObjects
          .filter((dto) => dto.car != null && typeof dto.car === "number")
          .map((dto) => dto.car as number),
      ),
    );

    // create cars as dtos
    const carDtoMap = new Map<string, CreateCarDto>(); // hash dto -> dto
    for (const dto of parsedObjects) {
      if (dto.car && typeof dto.car === "object") {
        const hash = this._hashCar(dto.car);
        carDtoMap.set(hash, dto.car);
      }
    }

    const humanNames = new Set<string>(parsedObjects.map((dto) => dto.name));

    const em = this.orm.em.fork();

    return retryTransaction(() =>
      em.transactional(
        async (tx) => {
          let okCount = 0;
          let duplicateCount = 0;

          //check car ids
          const invalidCars = await this._getInvalidCarIds(uniqueCarIds, tx);
          if (invalidCars.length > 0) {
            throw new BadRequestException(
              `Invalid cars: ${invalidCars.join(", ")}`,
            );
          }

          // check car dtos
          console.log("unique cars:", carDtoMap);
          const takenCarNames = await this._getTakenCarNames(
            Array.from(carDtoMap.values()),
            tx,
          );
          if (takenCarNames.length > 0) {
            throw new BadRequestException(
              `Car name must be unique - unavailable car names: ${takenCarNames.map((name) => `"${name}"`).join(", ")}`,
            );
          }

          // create cars as dtos
          const carMap = new Map<string, Car>(); // hash dto -> car entity
          for (const [hash, dto] of carDtoMap.entries()) {
            const car = tx.create(Car, dto as Omit<Car, "id">);
            carMap.set(hash, car);
          }

          const fromDB: HumanBeing[] = humanNames.size
            ? await tx.find(HumanBeing, {
                name: { $in: [...humanNames] },
                _next_version: null,
              })
            : [];
          const hbMap = new Map<string, HumanBeing>(
            fromDB.map((human) => [human.name, human]),
          );
          const toPersist: HumanBeing[] = [];

          console.log("importing into db...");
          for (const dto of parsedObjects) {
            // find duplicates
            const existing = hbMap.get(dto.name);

            let car: Car | undefined;
            if (dto.car && typeof dto.car === "object") {
              const hash = this._hashCar(dto.car);
              car = carMap.get(hash);
            }

            if (existing) {
              // duplicates found
              const humanBeing = tx.create(HumanBeing, {
                ...dto,
                car,
                _version: existing._version + 1,
                _version_root: existing._version_root
                  ? existing._version_root
                  : existing,
                creationDate: new Date(),
              });
              existing._next_version = humanBeing;
              hbMap.set(dto.name, humanBeing);
              toPersist.push(humanBeing);
              toPersist.push(existing);

              duplicateCount++;
            } else {
              const humanBeing = tx.create(HumanBeing, {
                ...dto,
                car,
                _version: 0,
                creationDate: new Date(),
              });
              hbMap.set(dto.name, humanBeing);
              toPersist.push(humanBeing);
              okCount++;
            }
          }
          tx.persist(toPersist);
          tx.persist(carMap.values());
          await tx.flush();

          console.log(
            `--- db import result: ${okCount} created, ${duplicateCount} duplicates`,
          );
          return { okCount, duplicateCount };
        },
        { isolationLevel: IsolationLevel.SERIALIZABLE },
      ),
    );
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
    const em: EntityManager = _em || this.orm.em.fork();
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
    const em: EntityManager = _em || this.orm.em.fork();
    const existingCars = await em.find(Car, { name: { $in: uniqueCarNames } });
    const takenCarNames = existingCars.map((car) => car.name);
    return takenCarNames;
  }
}
