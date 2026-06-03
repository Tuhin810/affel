import app from "./app";

import { env } from "./config/env";

import logger from "./config/logger";

import { connectDatabase } from "./config/database";

import { redisClient } from "./config/redis";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });

  await redisClient.ping();

  logger.info("Redis ping successful");

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received");

    server.close(() => {
      logger.info("Server closed");
    });
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received");

    server.close(() => {
      logger.info("Server closed");
    });
  });
};

startServer();