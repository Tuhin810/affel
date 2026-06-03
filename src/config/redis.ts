import Redis from "ioredis";

import logger from "./logger";

export const redisClient = new Redis(
  process.env.REDIS_URL as string,
  {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  }
);

redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

redisClient.on("error", (error) => {
  logger.error(`Redis Error: ${error.message}`);
});