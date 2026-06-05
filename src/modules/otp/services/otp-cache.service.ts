import { redisClient } from "../../../config/redis";
import logger from "../../../config/logger";

export class OtpCacheService {
  async saveOtp(
    key: string,
    value: string,
    ttlSeconds: number
  ): Promise<void> {
    try {
      await redisClient.set(
        key,
        value,
        "EX",
        ttlSeconds
      );
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`OTP cache save skipped (Redis unavailable): ${message}`);
    }
  }

  async getOtp(
    key: string
  ): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`OTP cache read failed (Redis unavailable): ${message}`);

      return null;
    }
  }

  async deleteOtp(
    key: string
  ): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unknown Redis error";

      logger.warn(`OTP cache delete skipped (Redis unavailable): ${message}`);
    }
  }
}
