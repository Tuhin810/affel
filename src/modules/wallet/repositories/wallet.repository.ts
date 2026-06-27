import prisma from "../../../database/prisma/client";
import { LedgerType } from "@prisma/client";
import { AppError } from "../../../common/errors/app.error";

export class WalletRepository {
  public async getOrCreateWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (wallet) return wallet;

    return prisma.wallet.create({
      data: {
        userId,
        balance: 0.0,
      },
    });
  }

  public async creditWallet(
    userId: string,
    amount: number,
    referenceId: string,
    description: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0.0 },
        });
      }

      // 2. Prevent duplicate credits (idempotency)
      const existingLedger = await tx.walletLedger.findFirst({
        where: {
          walletId: wallet.id,
          referenceId,
          type: LedgerType.CREDIT,
        },
      });

      if (existingLedger) {
        throw new AppError("Wallet already credited for this reference transaction", 409);
      }

      // 3. Create ledger entry
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          amount,
          type: LedgerType.CREDIT,
          description,
          referenceId,
        },
      });

      // 4. Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return updatedWallet;
    }, { timeout: 20000 });
  }

  public async debitWallet(
    userId: string,
    amount: number,
    referenceId: string,
    description: string
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.balance < amount) {
        throw new AppError("Insufficient wallet balance", 400);
      }

      // Create ledger entry (debit shows as negative amount in ledger history)
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          amount: -amount,
          type: LedgerType.DEBIT,
          description,
          referenceId,
        },
      });

      // Update balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return updatedWallet;
    }, { timeout: 20000 });
  }

  public async findLedgerEntries(walletId: string) {
    return prisma.walletLedger.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });
  }
}
