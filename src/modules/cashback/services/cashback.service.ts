import prisma from "../../../database/prisma/client";
import { CashbackStatus } from "@prisma/client";
import { RabbitMQService } from "../../../config/rabbitmq";
import logger from "../../../config/logger";

export class CashbackService {
  public async handleConversionReceived(event: {
    conversionId: string;
    clickId: string;
    transactionId: string;
    status: string;
    orderAmount: number;
    commissionAmount: number;
    cashbackAmount: number;
    userId?: string;
  }): Promise<void> {
    logger.info(`Cashback Service processing conversion event for transaction ${event.transactionId}`);

    // Resolve userId if not provided in the event
    let userId = event.userId;
    if (!userId) {
      const click = await prisma.click.findUnique({
        where: { clickId: event.clickId },
      });
      if (click) {
        userId = click.userId;
      }
    }

    if (!userId) {
      logger.error(`Cannot process cashback: No userId associated with clickId ${event.clickId}`);
      return;
    }

    // Check if cashback record already exists for this conversion
    const existing = await prisma.cashback.findFirst({
      where: { conversionId: event.conversionId },
    });

    // Map conversion status to cashback status
    let mappedStatus: CashbackStatus = CashbackStatus.PENDING;
    if (event.status === "APPROVED") {
      mappedStatus = CashbackStatus.APPROVED;
    } else if (event.status === "REJECTED" || event.status === "CANCELLED") {
      mappedStatus = CashbackStatus.REJECTED;
    }

    if (existing) {
      if (existing.status !== mappedStatus) {
        logger.info(`Updating cashback status from ${existing.status} to ${mappedStatus}`);
        const updated = await prisma.cashback.update({
          where: { id: existing.id },
          data: { status: mappedStatus },
        });

        if (updated.status === CashbackStatus.APPROVED) {
          logger.info(`Cashback approved for user ${userId}. Triggering wallet credit...`);
          await RabbitMQService.publish("cashback.approved", {
            cashbackId: updated.id,
            userId: updated.userId,
            amount: updated.amount,
            conversionId: updated.conversionId,
          });
        }
      }
      return;
    }

    // Create new cashback record
    const cashback = await prisma.cashback.create({
      data: {
        userId,
        conversionId: event.conversionId,
        amount: event.cashbackAmount,
        status: mappedStatus,
      },
    });

    logger.info(`Created new cashback record: ${cashback.id} with status ${cashback.status}`);

    await RabbitMQService.publish("cashback.created", {
      cashbackId: cashback.id,
      userId: cashback.userId,
      amount: cashback.amount,
      status: cashback.status,
    });

    if (cashback.status === CashbackStatus.APPROVED) {
      logger.info(`Cashback approved immediately for user ${userId}. Triggering wallet credit...`);
      await RabbitMQService.publish("cashback.approved", {
        cashbackId: cashback.id,
        userId: cashback.userId,
        amount: cashback.amount,
        conversionId: cashback.conversionId,
      });
    }
  }
}
export const cashbackService = new CashbackService();
