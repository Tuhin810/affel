import { WalletRepository } from "../repositories/wallet.repository";
import { RabbitMQService } from "../../../config/rabbitmq";
import logger from "../../../config/logger";

export class WalletService {
  private walletRepository = new WalletRepository();

  public async handleCashbackApproved(event: {
    cashbackId: string;
    userId: string;
    amount: number;
    conversionId: string;
  }): Promise<void> {
    logger.info(`Wallet Service processing cashback approval for user ${event.userId}`);

    try {
      const updatedWallet = await this.walletRepository.creditWallet(
        event.userId,
        event.amount,
        event.cashbackId,
        `Cashback credit for conversion ${event.conversionId}`
      );

      logger.info(`Credited user ${event.userId} wallet with ${event.amount}. New balance: ${updatedWallet.balance}`);

      // Publish event
      await RabbitMQService.publish("wallet.credited", {
        userId: event.userId,
        walletId: updatedWallet.id,
        amount: event.amount,
        newBalance: updatedWallet.balance,
        referenceId: event.cashbackId,
      });

      // Publish notification request
      await RabbitMQService.publish("notification.send", {
        userId: event.userId,
        type: "CASHBACK_CREDITED",
        title: "Cashback Credited!",
        message: `Congratulations! Your cashback of ₹${event.amount} has been credited to your wallet.`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to credit wallet: ${msg}`);
    }
  }

  public async getWallet(userId: string) {
    return this.walletRepository.getOrCreateWallet(userId);
  }

  public async getTransactions(userId: string) {
    const wallet = await this.walletRepository.getOrCreateWallet(userId);
    return this.walletRepository.findLedgerEntries(wallet.id);
  }
}
export const walletService = new WalletService();
