import { RabbitMQService } from "../config/rabbitmq";
import { cashbackService } from "./cashback/services/cashback.service";
import { walletService } from "./wallet/services/wallet.service";
import logger from "../config/logger";

export async function initializeEventConsumers(): Promise<void> {
  logger.info("Initializing RabbitMQ Event Consumers...");

  // 1. Conversion received -> handle cashback creation/update
  await RabbitMQService.consume(
    "conversion_received_queue",
    "conversion.received",
    async (payload) => {
      logger.info(`Consumer: Received conversion.received event: ${payload.transactionId}`);
      await cashbackService.handleConversionReceived(payload);
    }
  );

  // 2. Cashback approved -> handle wallet credit (ledger-based transaction)
  await RabbitMQService.consume(
    "cashback_approved_queue",
    "cashback.approved",
    async (payload) => {
      logger.info(`Consumer: Received cashback.approved event for cashback ID: ${payload.cashbackId}`);
      await walletService.handleCashbackApproved(payload);
    }
  );

  // 3. Logger consumer for other events
  await RabbitMQService.consume(
    "click_created_queue",
    "click.created",
    async (payload) => {
      logger.info(`Consumer Log: Click created with ID ${payload.clickId}`);
    }
  );

  await RabbitMQService.consume(
    "cashback_created_queue",
    "cashback.created",
    async (payload) => {
      logger.info(`Consumer Log: Cashback logged with ID ${payload.cashbackId}, status: ${payload.status}`);
    }
  );

  await RabbitMQService.consume(
    "wallet_credited_queue",
    "wallet.credited",
    async (payload) => {
      logger.info(`Consumer Log: Wallet ID ${payload.walletId} credited with ₹${payload.amount}`);
    }
  );

  await RabbitMQService.consume(
    "notification_send_queue",
    "notification.send",
    async (payload) => {
      logger.info(`Consumer Mock Notification: [${payload.type}] Title: "${payload.title}" Message: "${payload.message}"`);
    }
  );

  logger.info("RabbitMQ Event Consumers initialized successfully.");
}
