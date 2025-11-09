// yaml.worker.ts
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { parentPort, workerData } from "worker_threads";
import { CreateHumanBeingDto } from "../humanbeings/dto/create-humanbeing.dto";
import { ImportWorkerPayload } from "./types";

void (async () => {
  const content = fs.readFileSync(
    (workerData as { filePath: string }).filePath,
    "utf-8",
  );
  console.log("worker: parsing...");
  try {
    const parsed = yaml.load(content);
    const validItems: CreateHumanBeingDto[] = [];

    if (!Array.isArray(parsed)) {
      parentPort?.postMessage({
        validItems,
        ok: false,
        msg: "not an array",
      } satisfies ImportWorkerPayload);
      return;
    }

    for (const obj of parsed) {
      const dto = plainToClass(CreateHumanBeingDto, obj);
      const errors = await validate(dto);
      if (errors.length === 0) validItems.push(dto);
    }

    console.log(`worker: processed ${validItems.length} items`);
    parentPort?.postMessage({
      validItems,
      ok: true,
    } satisfies ImportWorkerPayload);
  } catch (e: unknown) {
    parentPort?.postMessage({
      validItems: [],
      ok: false,
      error: e,
    } satisfies ImportWorkerPayload);
  }
})();
