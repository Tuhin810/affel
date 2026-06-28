import { ConversionRepository } from "../repositories/conversion.repository";
import { RabbitMQService } from "../../../config/rabbitmq";
import { ConversionStatus } from "@prisma/client";
import prisma from "../../../database/prisma/client";
import logger from "../../../config/logger";

export class ConversionService {
  private conversionRepository = new ConversionRepository();

  public async processConversion(data: {
    clickId?: string | null;
    transactionId: string;
    orderAmount: number;
    commissionAmount: number;
    cashbackAmount?: number | null;
    status: ConversionStatus;
    conversionDate?: Date;
  }): Promise<any> {
    const existing = await this.conversionRepository.findByTransactionId(data.transactionId);

    if (existing) {
      if (existing.status !== data.status) {
        logger.info(
          `Updating existing conversion transaction ${data.transactionId} status from ${existing.status} to ${data.status}`
        );
        const updated = await this.conversionRepository.updateStatus(existing.id, data.status);
        
        // Publish status update event
        await RabbitMQService.publish("conversion.created", {
          conversionId: updated.id,
          clickId: updated.clickId,
          transactionId: updated.transactionId,
          status: updated.status,
          orderAmount: updated.orderAmount,
          commissionAmount: updated.commissionAmount,
          cashbackAmount: updated.cashbackAmount,
        });
        return updated;
      }
      logger.info(`Conversion transaction ${data.transactionId} already processed with status ${data.status}. Skipping.`);
      return existing;
    }

    let resolvedCashbackAmount = data.cashbackAmount;
    let userId: string | null = null;

    if (data.clickId) {
      const click = await prisma.click.findUnique({
        where: { clickId: data.clickId },
      });
      if (click) {
        userId = click.userId;
        if (resolvedCashbackAmount === undefined || resolvedCashbackAmount === null) {
          if (click.affiliateLinkId) {
            const link = await prisma.affiliateLink.findUnique({
              where: { id: click.affiliateLinkId },
            });
            if (link) {
              resolvedCashbackAmount = (data.orderAmount * link.cashbackPercent) / 100;
            }
          }
        }
      }
    }

    if (resolvedCashbackAmount === undefined || resolvedCashbackAmount === null) {
      // Default fallback: 70% of commission
      resolvedCashbackAmount = data.commissionAmount * 0.70;
    }

    // Create conversion record
    const conversion = await this.conversionRepository.createConversion({
      clickId: data.clickId,
      transactionId: data.transactionId,
      orderAmount: data.orderAmount,
      commissionAmount: data.commissionAmount,
      cashbackAmount: resolvedCashbackAmount,
      status: data.status,
      conversionDate: data.conversionDate,
    });

    logger.info(`Created new conversion record for transaction: ${data.transactionId}`);

    // Publish RabbitMQ event
    await RabbitMQService.publish("conversion.created", {
      conversionId: conversion.id,
      clickId: conversion.clickId,
      transactionId: conversion.transactionId,
      status: conversion.status,
      orderAmount: conversion.orderAmount,
      commissionAmount: conversion.commissionAmount,
      cashbackAmount: conversion.cashbackAmount,
      userId: userId,
    });

    return conversion;
  }
}

export const conversionService = new ConversionService();
export default conversionService;
