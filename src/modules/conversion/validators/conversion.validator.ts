import { z } from "zod";

export const createConversionSchema = z.object({
  clickId: z.string().optional().nullable(),
  transactionId: z.string().min(1, "Transaction ID is required"),
  orderAmount: z.number().nonnegative("Order amount must be non-negative"),
  commissionAmount: z.number().nonnegative("Commission amount must be non-negative"),
  cashbackAmount: z.number().nonnegative("Cashback amount must be non-negative").optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
  conversionDate: z.string().datetime().optional().or(z.date().optional()),
});

export const importConversionsSchema = z.object({
  conversions: z.array(createConversionSchema).min(1, "At least one conversion is required for import"),
});
