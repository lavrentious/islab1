import { ConflictException, HttpException } from "@nestjs/common";

function extractSqlState(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const e = error as Record<string, unknown>;

  const driverError =
    e["driverError"] && typeof e["driverError"] === "object"
      ? (e["driverError"] as Record<string, unknown>)
      : undefined;

  const cause =
    e["cause"] && typeof e["cause"] === "object"
      ? (e["cause"] as Record<string, unknown>)
      : undefined;

  const candidates = [
    e["code"],
    e["sqlState"],
    driverError?.["code"],
    cause?.["code"],
    cause?.["sqlState"],
  ];

  for (const c of candidates) {
    if (typeof c === "string") return c;
    if (typeof c === "number") return String(c);
  }

  return undefined;
}

export async function retryTransaction<T>(
  fn: () => Promise<T>,
  maxRetries = 10,
  baseDelayMs = 200,
  maxDelayMs = 1500,
): Promise<T> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }

      const sqlState = extractSqlState(err);

      // 40001 = serialization failure (including write skew)
      const isSerializationError = sqlState === "40001" || sqlState === "40P01";

      if (!isSerializationError) {
        throw err;
      }

      attempts++;

      if (attempts >= maxRetries) {
        break;
      }

      const sleepTime =
        Math.random() * Math.min(maxDelayMs, baseDelayMs * 2 ** attempts);
      console.log(`attempt ${attempts}: sleeping for ${sleepTime} ms...`);
      await new Promise((res) => setTimeout(res, sleepTime));
    }
  }

  throw new ConflictException(
    "Transaction failed after multiple retries. It may succeed if retried.",
  );
}
