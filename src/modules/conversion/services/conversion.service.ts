import { ConversionRepository } from "../repositories/conversion.repository";
import { ParsedConversion } from "../../tracking/adapters/network-adapter.interface";
import { RabbitMQService } from "../../../config/rabbitmq";
import { ConversionStatus } from "@prisma/client";
import prisma from "../../../database/prisma/client";
import logger from "../../../config/logger";

export class ConversionService {
  private conversionRepository = new ConversionRepository();

  public async processConversion(parsed: ParsedConversion, networkId: string): Promise<void> {
    const existing = await this.conversionRepository.findByTransactionId(parsed.transactionId);

    if (existing) {
      // Idempotency: webhook deduplication
      if (existing.status !== parsed.status) {
        logger.info(
          `Updating existing conversion transaction ${parsed.transactionId} status from ${existing.status} to ${parsed.status}`
        );
        const updated = await this.conversionRepository.updateStatus(existing.id, parsed.status as ConversionStatus);
        
        // Publish status update event
        await RabbitMQService.publish("conversion.received", {
          conversionId: updated.id,
          clickId: updated.clickId,
          transactionId: updated.transactionId,
          status: updated.status,
          orderAmount: updated.orderAmount,
          commissionAmount: updated.commissionAmount,
          cashbackAmount: updated.cashbackAmount,
        });
      } else {
        logger.info(`Conversion transaction ${parsed.transactionId} already processed with status ${parsed.status}. Skipping.`);
      }
      return;
    }

    // New conversion: Resolve click
    const click = await prisma.click.findUnique({
      where: { clickId: parsed.clickId },
    });

    if (!click) {
      logger.warn(`Attribution Failure: No click record found for clickId: ${parsed.clickId}. Logging conversion anyway.`);
    }

    // Calculate cashback amount (70% of the network commission received goes to the user, or calculate based on product percentage)
    let cashbackAmount = parsed.commissionAmount * 0.70;
    
    if (click && click.entityType.toUpperCase() === "PRODUCT" && click.productSourceId) {
      const source = await prisma.productAffiliateLink.findUnique({
        where: { id: click.productSourceId },
      });
      if (source && source.cashbackPercentage) {
        // If product has specific cashback percentage, calculate based on order amount
        cashbackAmount = (parsed.orderAmount * source.cashbackPercentage) / 100;
      }
    }

    // Create conversion record
    const conversion = await this.conversionRepository.createConversion({
      clickId: parsed.clickId,
      transactionId: parsed.transactionId,
      networkId,
      orderAmount: parsed.orderAmount,
      commissionAmount: parsed.commissionAmount,
      cashbackAmount: cashbackAmount,
      status: parsed.status as ConversionStatus,
      conversionDate: parsed.conversionDate,
    });

    logger.info(`Created new conversion record for transaction: ${parsed.transactionId}`);

    // Publish RabbitMQ event
    await RabbitMQService.publish("conversion.received", {
      conversionId: conversion.id,
      clickId: conversion.clickId,
      transactionId: conversion.transactionId,
      status: conversion.status,
      orderAmount: conversion.orderAmount,
      commissionAmount: conversion.commissionAmount,
      cashbackAmount: conversion.cashbackAmount,
      userId: click ? click.userId : null,
    });
  }
}
export const conversionService = new ConversionService();
