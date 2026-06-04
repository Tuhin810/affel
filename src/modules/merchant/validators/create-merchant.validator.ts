import { z } from "zod";

export const createMerchantSchema = z.object({
  name: z.string().min(2).max(100),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),

  description: z.string().optional(),

  websiteUrl: z.string().url().optional(),

  affiliateUrl: z.string().url().optional(),

  logoUrl: z.string().url().optional(),

  bannerUrl: z.string().url().optional(),

  cashbackText: z.string().optional(),

  termsAndConditions: z.string().optional(),

  isFeatured: z.boolean().optional(),
});