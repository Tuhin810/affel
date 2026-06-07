import { z } from "zod";

export const updateMerchantSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),

  description: z.string().optional(),

  websiteUrl: z.string().url().optional(),

  affiliateUrl: z.string().url().optional(),

  logoUrl: z.string().url().optional(),

  logoPublicId: z.string().min(1).optional(),

  bannerUrl: z.string().url().optional(),

  cashbackText: z.string().optional(),

  termsAndConditions: z.string().optional(),

  isFeatured: z.boolean().optional(),
});
