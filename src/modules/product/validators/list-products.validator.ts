import { z } from "zod";

const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "cashback_desc",
  "featured",
] as const;

export const listProductsSchema = z.object({
  search:   z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(200).optional(),
  minPrice: z.coerce.number().nonnegative("minPrice must be >= 0").optional(),
  maxPrice: z.coerce.number().nonnegative("maxPrice must be >= 0").optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort:     z.enum(SORT_OPTIONS).optional(),
  page:     z.coerce.number().int().min(1, "page must be >= 1").default(1),
  limit:    z.coerce.number().int().min(1).max(100, "limit cannot exceed 100").default(20),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] }
);

export type ListProductsInput = z.infer<typeof listProductsSchema>;
