import app from "./app";

import { env } from "./config/env";

import logger from "./config/logger";

import { connectDatabase } from "./config/database";

import { redisClient } from "./config/redis";

import { RabbitMQService } from "./config/rabbitmq";

import { initializeEventConsumers } from "./modules/event-consumers";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  // Initialize RabbitMQ and start consumers
  await RabbitMQService.connect();
  await initializeEventConsumers();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });

  try {
    await redisClient.ping();

    logger.info("Redis ping successful");
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unknown Redis error";

    logger.warn(`Redis is unavailable. Continuing without cache. ${message}`);
  }

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