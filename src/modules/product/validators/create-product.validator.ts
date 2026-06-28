import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(100),
  description: z.string().min(1, "Description is required"),
  categoryIds: z
    .array(z.string().uuid("Each category ID must be a valid UUID"))
    .min(1, "At least one category is required"),
  imageUrls: z
    .array(z.string().url("Each image URL must be a valid URL"))
    .min(1, "At least one product image is required")
    .max(6, "Maximum 6 product images allowed"),
  imagePublicIds: z
    .array(z.string().min(1))
    .max(6, "Maximum 6 product image public IDs allowed")
    .optional(),
  price: z.number().nonnegative("Price must be a non-negative number"),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  cashbackPercentage: z
    .number()
    .min(0, "Cashback percentage must be at least 0")
    .max(100, "Cashback percentage cannot exceed 100"),
  cashbackTerms: z.string().min(1, "Cashback terms are required"),
  trackingTime: z.number().int().nonnegative("Tracking time must be a non-negative integer"),
  validationTime: z.number().int().nonnegative("Validation time must be a non-negative integer"),
  paymentRelease: z.number().int().nonnegative("Payment release time must be a non-negative integer"),
});
