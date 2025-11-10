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

const BATCH_SIZE = 500;
const MAX_RETRIES = 3;

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
    const em = this.orm.em.fork();
    let totalOk = 0;
    let totalDuplicates = 0;

    const batches: CreateHumanBeingDto[][] = [];
    for (let i = 0; i < parsedObjects.length; i += BATCH_SIZE) {
      batches.push(parsedObjects.slice(i, i + BATCH_SIZE));
    }

    console.log(
      `Processing ${parsedObjects.length} items in ${batches.length} batches`,
    );

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      let retries = MAX_RETRIES;

      while (retries > 0) {
        try {
          let okCount = 0;
          let duplicateCount = 0;

          await em.transactional(
            async (tx) => {
              console.log(
                `batch ${batchIndex + 1}/${batches.length}: importing ${batch.length} items...`,
              );
              for (const dto of batch) {
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
                const existing = await tx.find(HumanBeing, { name: dto.name });
                if (existing.length > 0) {
                  const max = existing.reduce((a, b) =>
                    a._version > b._version ? a : b,
                  );

                  const humanBeing = tx.create(HumanBeing, {
                    ...dto,
                    _version: max._version + 1,
                    _version_root: max._version_root
                      ? max._version_root
                      : max.id,
                    creationDate: new Date(),
                  });
                  tx.persist(humanBeing);

                  max._next_version = humanBeing;
                  tx.persist(max);
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
              await tx.flush();
            },
            { isolationLevel: IsolationLevel.SERIALIZABLE },
          );

          console.log(
            `batch ${batchIndex + 1}/${batches.length}: ${okCount} created, ${duplicateCount} duplicates`,
          );

          totalOk += okCount;
          totalDuplicates += duplicateCount;
          break;
        } catch (e) {
          if (
            e instanceof DriverException &&
            e.code === "40001" &&
            retries > 1
          ) {
            console.warn(
              `serialization conflict in batch ${batchIndex + 1}, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`,
            );
            retries--;
            continue;
          }
          throw e;
        }
      }
    }

    console.log(
      `--- import done: ${totalOk} created, ${totalDuplicates} duplicates`,
    );
    return { okCount: totalOk, duplicateCount: totalDuplicates };
  }
}
