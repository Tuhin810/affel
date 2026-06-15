import prisma from "../database/prisma/client";
import logger from "./logger";
import { seedCategories } from "../database/seeds/category.seeder";

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");

    // Seed categories automatically on startup
    await seedCategories();
  } catch (error) {
    logger.error("Database connection failed", error);
    process.exit(1);
  }
};