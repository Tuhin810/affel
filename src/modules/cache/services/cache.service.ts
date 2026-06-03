import { redisClient } from "../../../config/redis";

export class CacheService {
  async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<void> {
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
  }

  async get(
    key: string
  ): Promise<string | null> {
    return redisClient.get(key);
  }

  async delete(
    key: string
  ): Promise<void> {
    await redisClient.del(key);
  }
}