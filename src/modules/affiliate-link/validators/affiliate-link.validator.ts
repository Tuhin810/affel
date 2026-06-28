import { z } from "zod";

export const createAffiliateLinkSchema = z.object({
  entityType: z.enum(["MERCHANT", "PRODUCT_SOURCE", "CATEGORY", "BANNER", "CAMPAIGN", "OFFER", "REFERRAL"]),
  entityId: z.string().min(1, "Entity ID is required"),
  merchantId: z.string().optional().nullable(),
  originalUrl: z.string().url("Original URL must be a valid URL"),
  affiliateUrl: z.string().url("Affiliate URL must be a valid URL"),
  cashbackPercent: z.number().min(0).max(100),
  commissionPercent: z.number().min(0).max(100).optional().nullable(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateAffiliateLinkSchema = z.object({
  originalUrl: z.string().url().optional(),
  affiliateUrl: z.string().url().optional(),
  cashbackPercent: z.number().min(0).max(100).optional(),
  commissionPercent: z.number().min(0).max(100).optional().nullable(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
