import { redisClient } from "../../../config/redis";
import logger from "../../../config/logger";

export class CacheService {
  async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      if (ttlSeconds) {
        await redisClient.set(
          key,
          value,
          "EX",
          ttlSeconds
        );

        return;
      }

      await redisClient.set(key, value);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`Cache set skipped (Redis unavailable): ${message}`);
    }
  }

  async get(
    key: string
  ): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`Cache get failed (Redis unavailable): ${message}`);

      return null;
    }
  }

  async delete(
    key: string
  ): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`Cache delete skipped (Redis unavailable): ${message}`);
    }
  }
}