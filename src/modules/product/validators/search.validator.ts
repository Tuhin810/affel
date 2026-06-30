import { z } from "zod";

export const searchSchema = z.object({
  type:  z.enum(["product", "category"]).default("product"),
  q:     z.string().min(1, "q is required").max(200),
  page:  z.coerce.number().int().min(1, "page must be >= 1").default(1),
  limit: z.coerce.number().int().min(1).max(100, "limit cannot exceed 100").default(20),
});

export type SearchInput = z.infer<typeof searchSchema>;
