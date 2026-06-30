import { z } from "zod";

export const updateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(100).optional(),
  description: z.string().min(1, "Description is required").optional(),
  categoryIds: z
    .array(z.string().uuid("Each category ID must be a valid UUID"))
    .min(1, "At least one category is required")
    .optional(),
  imageUrls: z
    .array(z.string().url("Each image URL must be a valid URL"))
    .min(1, "At least one product image is required")
    .max(6, "Maximum 6 product images allowed")
    .optional(),
  imagePublicIds: z
    .array(z.string().min(1))
    .max(6, "Maximum 6 product image public IDs allowed")
    .optional(),
  price: z.number().nonnegative("Price must be a non-negative number").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  cashbackPercentage: z
    .number()
    .min(0, "Cashback percentage must be at least 0")
    .max(100, "Cashback percentage cannot exceed 100")
    .optional(),
  cashbackTerms: z.string().min(1, "Cashback terms are required").optional(),
  trackingTime: z.number().int().nonnegative("Tracking time must be a non-negative integer").optional(),
  validationTime: z.number().int().nonnegative("Validation time must be a non-negative integer").optional(),
  paymentRelease: z.number().int().nonnegative("Payment release time must be a non-negative integer").optional(),
  affiliateLinks: z
    .array(
      z.object({
        platformName: z.string().min(1, "Platform name is required"),
        affiliateLink: z.string().url("Affiliate link must be a valid URL"),
        mrp: z.number().nonnegative("MRP must be a non-negative number"),
        sellPrice: z.number().nonnegative("Selling price must be a non-negative number"),
        cashbackPercentage: z.number().nonnegative("Cashback percentage must be non-negative"),
      })
    )
    .optional(),
});
