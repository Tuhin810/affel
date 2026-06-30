import app from "./app";
import { env } from "./config/env";
import logger from "./config/logger";
import { connectDatabase } from "./config/database";
import { redisClient } from "./config/redis";
import { RabbitMQService } from "./config/rabbitmq";
import { initializeEventConsumers } from "./modules/event-consumers";
import os from "os";

// Helper to get local IP address
const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const iface of ifaceList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
};

// Helper to pad the whole line to exactly 60 chars of visual length
const padLine = (content: string): string => {
  const cleanContent = content.replace(/\x1b\[[0-9;]*m/g, '');
  const len = cleanContent.length;
  const spacesNeeded = 60 - len;
  if (spacesNeeded > 0) {
    return content + ' '.repeat(spacesNeeded);
  }
  return content;
};

const startServer = async (): Promise<void> => {
  // Connect to database
  await connectDatabase();

  // Initialize RabbitMQ and start consumers
  await RabbitMQService.connect();
  await initializeEventConsumers();

  // Test Redis connection
  let redisStatus = "Connected";
  try {
    await redisClient.ping();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Redis error";
    logger.warn(`Redis is unavailable. Continuing without cache. ${message}`);
    redisStatus = "Unavailable";
  }

  const server = app.listen(env.port, () => {
    const localIp = getLocalIP();
    
    const cyan = '\x1b[36m';
    const orange = '\x1b[38;5;208m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const gray = '\x1b[90m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const white = '\x1b[37m';

    console.log(`\n${cyan}  ┌────────────────────────────────────────────────────────────┐${reset}`);
    console.log(`${cyan}  │${reset}${padLine(' '.repeat(60))}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine('    ██████╗ ██╗  ██╗  █████╗ ██████╗  █████╗ ████████╗')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine('    ██╔══██╗██║  ██║ ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine('    ██████╔╝███████║ ███████║██████╔╝███████║   ██║   ')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine('    ██╔══██╗██╔══██║ ██╔══██║██╔══██╗██╔══██║   ██║   ')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine('    ██████╔╝██║  ██║ ██║  ██║██║  ██║██║  ██║   ██║   ')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine('    ╚══════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ')}${cyan}│${reset}`.replace(/██████╗|██████╔╝|██╔══██╗|██╔══██║|█████╗|██╔══██╗|███████║|██║|██║|██║|██╔══██║|██╔══██║|███████║|██║|██║|██║|╚══════╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚═╝|╚══██╔══╝|╚══██╔══╝|███████║|██║|██║|██║/g, match => `${orange}${bold}${match}${reset}`));
    console.log(`${cyan}  │${reset}${padLine(' '.repeat(60))}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${white}${bold}BharatOne - Affiliate Marketing Backend System${reset} ${gray}v1.0.0${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  ├────────────────────────────────────────────────────────────┤${reset}`);
    console.log(`${cyan}  │${reset}${padLine(' '.repeat(60))}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}Status:${reset}      ${green}${bold}⚡ API SERVER INITIALIZED SUCCESSFULLY${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}Mode:${reset}        ${yellow}${env.nodeEnv || 'development'}${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}Port:${reset}        ${green}${env.port}${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}Redis:${reset}       ${redisStatus === 'Connected' ? green + '🟢 Connected' : yellow + '⚠️ ' + redisStatus}${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}RabbitMQ:${reset}    ${green}🟢 Connected${reset}`)}${cyan}│${reset}`);
    console.log(`${cyan}  │${reset}${padLine(`  ${gray}Local URL:${reset}   ${white}${bold}http://localhost:${env.port}/api/v1${reset}`)}${cyan}│${reset}`);
    if (localIp !== 'localhost') {
      console.log(`${cyan}  │${reset}${padLine(`  ${gray}Network URL:${reset} ${white}${bold}http://${localIp}:${env.port}/api/v1${reset}`)}${cyan}│${reset}`);
    }
    console.log(`${cyan}  │${reset}${padLine(' '.repeat(60))}${cyan}│${reset}`);
    console.log(`${cyan}  └────────────────────────────────────────────────────────────┘${reset}\n`);
  });

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