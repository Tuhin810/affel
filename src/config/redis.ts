import Redis from "ioredis";
import logger from "./logger";
import { env } from "./env";

export const redisClient = new Redis(
  env.redisUrl as string,
  {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  }
);

redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

redisClient.on("error", (error) => {
  logger.error(`Redis Error: ${error.message}`);
});