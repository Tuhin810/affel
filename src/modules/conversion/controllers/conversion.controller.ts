import { Request, Response } from "express";
import { ZodError } from "zod";
import { ConversionService } from "../services/conversion.service";
import { createConversionSchema, importConversionsSchema } from "../validators/conversion.validator";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";

export class ConversionController {
  private conversionService = new ConversionService();

  public async create(req: Request, res: Response): Promise<void> {
    const parsed = createConversionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const conversion = await this.conversionService.processConversion({
      ...parsed.data,
      conversionDate: parsed.data.conversionDate ? new Date(parsed.data.conversionDate) : undefined,
    });
    res.status(201).json(ApiResponse.success(conversion, "Conversion recorded successfully"));
  }

  public async importConversions(req: Request, res: Response): Promise<void> {
    const parsed = importConversionsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const results = [];
    for (const item of parsed.data.conversions) {
      try {
        const conversion = await this.conversionService.processConversion({
          ...item,
          conversionDate: item.conversionDate ? new Date(item.conversionDate) : undefined,
        });
        results.push({ transactionId: item.transactionId, status: "SUCCESS", id: conversion.id });
      } catch (error) {
        results.push({
          transactionId: item.transactionId,
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.status(200).json(ApiResponse.success(results, "Bulk conversions processed"));
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}

export const conversionController = new ConversionController();
export default conversionController;
