import { DriverException, MikroORM } from "@mikro-orm/postgresql";
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
    let okCount = 0;
    let duplicateCount = 0;
    await em.transactional(async (tx) => {
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
        const existing = await tx.find(HumanBeing, { name: dto.name });
        if (existing.length > 0) {
          // duplicates found
          const max = existing.reduce((a, b) =>
            a._version > b._version ? a : b,
          );

          const humanBeing = tx.create(HumanBeing, {
            ...dto,
            _version: max._version + 1,
            _version_root: max._version_root ? max._version_root : max.id,
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
      console.log(
        `--- db import result: ${okCount} created, ${duplicateCount} duplicates`,
      );
      await tx.flush();
    });
    return { okCount, duplicateCount };
  }
}
