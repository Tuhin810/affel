import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "RABBITMQ_URL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const env = {
  port: Number(process.env.PORT),

  nodeEnv: process.env.NODE_ENV as string,

  databaseUrl: process.env.DATABASE_URL as string,

  redisUrl: process.env.REDIS_URL as string,

  jwtSecret: process.env.JWT_SECRET as string,

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,

  rabbitmqUrl: process.env.RABBITMQ_URL as string,
};