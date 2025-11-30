import { Process, Processor } from "@nestjs/bull";
import { InternalServerErrorException } from "@nestjs/common";
import { type Job } from "bull";
import * as path from "path";
import { Worker } from "worker_threads";
import {
  ImporterProcessorPayload,
  ImporterProcessorResult,
  ImportWorkerPayload,
  ImportWorkerResult,
} from "./types";

@Processor("import-queue")
export class ImporterProcessor {
  @Process({ name: "parse-file", concurrency: 2 }) // concurrency: 13
  async parseFile(
    job: Job<ImporterProcessorPayload>,
  ): Promise<ImporterProcessorResult> {
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
    if (!data.error && data.ok) {
      return { ok: true, validItems: data.validItems };
    } else {
      const ans: ImporterProcessorResult = { ok: false };
      if (data.validItems.length == 0) {
        ans.errorMessage = "no valid items";
      } else if (data.msg) {
        ans.errorMessage = data.msg;
      }
      return ans;
    }
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
}
