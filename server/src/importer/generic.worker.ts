import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as fs from "fs";
import * as path from "path";
import { parentPort, workerData } from "worker_threads";
import { CreateHumanBeingDto } from "../humanbeings/dto/create-humanbeing.dto";
import { getParser } from "./parsers";
import { ImportWorkerPayload, ImportWorkerResult } from "./types";

// parses + validates (CPU heavy)
void (async () => {
  const data = workerData as ImportWorkerPayload;
  console.log("worker: parsing...");
  try {
    const content = fs.readFileSync(data.filePath, "utf-8");
    const ext = path.extname(data.filePath).slice(1);
    const parse = getParser(ext);
    if (!parse) {
      parentPort?.postMessage({
        validItems: [],
        ok: false,
        msg: "unsupported file type",
      } satisfies ImportWorkerResult);
      return;
    }
    const parsed = parse(content);

    if (!Array.isArray(parsed)) {
      parentPort?.postMessage({
        validItems: [],
        ok: false,
        msg: "not an array",
      } satisfies ImportWorkerResult);
      return;
    }

    const validItems: CreateHumanBeingDto[] = [];
    for (const obj of parsed) {
      const dto = plainToClass(CreateHumanBeingDto, obj);
      const errors = await validate(dto);
      if (errors.length === 0) validItems.push(dto);
    }

    console.log(`worker: processed ${validItems.length} items`);
    parentPort?.postMessage({
      validItems,
      ok: true,
    } satisfies ImportWorkerResult);
  } catch (e: unknown) {
    parentPort?.postMessage({
      validItems: [],
      ok: false,
      error: e,
    } satisfies ImportWorkerResult);
  }
})();
