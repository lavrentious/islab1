import {
  DriverException,
  IsolationLevel,
  MikroORM,
} from "@mikro-orm/postgresql";
import { Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
import { type Job } from "bull";
import * as path from "path";
import { Car } from "src/cars/entities/car.entity";
import { CreateHumanBeingDto } from "src/humanbeings/dto/create-humanbeing.dto";
import { HumanBeing } from "src/humanbeings/entities/humanbeing.entity";
import { Worker } from "worker_threads";
import {
  ImportOperation,
  ImportStatus,
} from "./entities/importoperation.entity";
import { ImporterProcessorPayload, ImportWorkerPayload } from "./types";

const MAX_RETRIES = 20;

@Processor("import-queue")
export class ImporterProcessor {
  constructor(private readonly orm: MikroORM) {}

  @Process({ name: "import-yaml", concurrency: 2 }) // concurrency: 13
  async importYaml(job: Job<ImporterProcessorPayload>) {
    const em = this.orm.em.fork(); // ✅ создаём отдельный контекст
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
    while (retries < MAX_RETRIES) {
      try {
        const em = this.orm.em.fork();
        let okCount = 0;
        let duplicateCount = 0;
        await em.transactional(
          async (tx) => {
            console.log("importing into db...");
            for (const dto of parsedObjects) {
              // check FKs
              if (dto.car != null) {
                const car = await tx.findOne(Car, { id: dto.car });
                if (!car) {
                  throw new Error(
                    `car ${dto.car} not found (human being name = "${dto.name}")`,
                  );
                }
              }
              // find duplicates
              const existing = await tx.findOne(HumanBeing, {
                name: dto.name,
                _next_version: null,
              });
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
                tx.persist(humanBeing);

                existing._next_version = humanBeing;
                tx.persist(existing);

                duplicateCount++;
              } else {
                const humanBeing = tx.create(HumanBeing, {
                  ...dto,
                  _version: 0,
                  creationDate: new Date(),
                });
                tx.persist(humanBeing);
                okCount++;
              }
            }
            console.log(
              `--- db import result: ${okCount} created, ${duplicateCount} duplicates`,
            );
            await tx.flush();
          },
          { isolationLevel: IsolationLevel.SERIALIZABLE },
        );
        return { okCount, duplicateCount };
      } catch (e) {
        if (e instanceof DriverException && e.code === "40001") {
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
}
