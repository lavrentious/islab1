import {
  DriverException,
  EntityManager,
  IsolationLevel,
  MikroORM,
} from "@mikro-orm/postgresql";
import { Process, Processor } from "@nestjs/bull";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { type Job } from "bull";
import * as path from "path";
import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { HumanBeing } from "src/humanbeings/entities/humanbeing.entity";
import { Worker } from "worker_threads";
import {
  ImportOperation,
  ImportStatus,
} from "./entities/importoperation.entity";

import { Car } from "src/cars/entities/car.entity";
import { ImporterProcessorPayload, ImportWorkerPayload } from "./types";

const MAX_RETRIES = 20;

@Processor("import-queue")
export class ImporterProcessor {
  constructor(private readonly orm: MikroORM) {}

  @Process({ name: "import-yaml", concurrency: 2 }) // concurrency: 13
  async importYaml(job: Job<ImporterProcessorPayload>) {
    const em = this.orm.em.fork();
    const importOp = await em.findOne(ImportOperation, {
      id: job.data.importOp,
    });
    if (!importOp) {
      throw new InternalServerErrorException("importOp not found");
    }
    importOp.status = ImportStatus.IN_PROGRESS;
    await em.persistAndFlush(importOp);

    // parse
    console.log("processor: running worker...");
    const data = (await this.runWorker(
      job.data.filePath,
    )) as ImportWorkerPayload;
    console.log(
      `processor: received data from worker: ${data.validItems.length} items`,
    );
    console.log(`processor: msg="${data.msg}"`);

    // save
    if (!data.error && data.ok) {
      try {
        const res = await this.saveToDatabase(data.validItems);
        importOp.status = ImportStatus.SUCCESS;
        importOp.okCount = res.okCount;
        importOp.duplicateCount = res.duplicateCount;
      } catch (e) {
        console.log("processor: error saving to db", e);
        importOp.status = ImportStatus.FAILED;
        if (e instanceof DriverException) {
          console.error("processor: error saving to db", e);
          importOp.errorMessage = "internal error (db)";
        } else if (e instanceof Error) {
          importOp.errorMessage = e.message;
        }
      } finally {
        importOp.finishedAt = new Date();
        await em.persistAndFlush(importOp);
      }
    } else {
      importOp.status = ImportStatus.FAILED;
      if (data.validItems.length == 0) {
        importOp.errorMessage = "no valid items";
      } else if (data.msg) {
        importOp.errorMessage = data.msg;
      }
      await em.persistAndFlush(importOp);
    }
  }

  private runWorker(filePath: string) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "yaml.worker.js"), {
        workerData: { filePath },
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

  private async saveToDatabase(parsedObjects: CreateHumanBeingDto[]): Promise<{
    okCount: number;
    duplicateCount: number;
  }> {
    let retries = 0;
    const invalidCars = await this._getInvalidCars(parsedObjects);
    if (invalidCars.length > 0) {
      throw new BadRequestException(`Invalid cars: ${invalidCars.join(", ")}`);
    }

    const humanNames = new Set<string>(parsedObjects.map((dto) => dto.name));

    while (retries < MAX_RETRIES) {
      try {
        const em = this.orm.em.fork();
        let okCount = 0;
        let duplicateCount = 0;
        const res = await em.transactional(
          async (tx) => {
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

              if (existing) {
                // duplicates found
                const humanBeing = tx.create(HumanBeing, {
                  ...dto,
                  _version: existing._version + 1,
                  _version_root: existing._version_root
                    ? existing._version_root
                    : existing.id,
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
                  _version: 0,
                  creationDate: new Date(),
                });
                hbMap.set(dto.name, humanBeing);
                toPersist.push(humanBeing);
                okCount++;
              }
            }
            tx.persist(toPersist);
            await tx.flush();

            console.log(
              `--- db import result: ${okCount} created, ${duplicateCount} duplicates`,
            );
            return { okCount, duplicateCount };
          },
          { isolationLevel: IsolationLevel.SERIALIZABLE },
        );
        return res;
      } catch (e) {
        if ("code" in e && (e as DriverException).code === "40001") {
          console.log(`retrying (${retries + 1}/${MAX_RETRIES})...`);
          retries++;
          continue;
        }
        throw e;
      }
    }
    throw new InternalServerErrorException(
      `Failed to import ${parsedObjects.length} items after ${MAX_RETRIES} retries`,
    );
  }

  async _getInvalidCars(
    dtos: CreateHumanBeingDto[],
    _em?: EntityManager,
  ): Promise<number[]> {
    const em: EntityManager = _em || this.orm.em.fork();
    const uniqueCarIds = Array.from(
      new Set(dtos.filter((dto) => dto.car != null).map((dto) => dto.car!)),
    );
    if (uniqueCarIds.length === 0) return [];
    const existingCars = await em.find(Car, { id: { $in: uniqueCarIds } });
    const validCarIds = new Set(existingCars.map((car) => car.id));
    const invalidCarIds = uniqueCarIds.filter((id) => !validCarIds.has(id));
    return invalidCarIds;
  }
}
