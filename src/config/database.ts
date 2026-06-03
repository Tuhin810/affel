import prisma from "../database/prisma/client";

import logger from "./logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();

    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed");

    process.exit(1);
  }
};