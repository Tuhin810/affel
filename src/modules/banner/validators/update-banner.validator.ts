import { z } from "zod";

export const updateBannerSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  offerTitle: z.string().optional(),
  link: z.string().optional(),
  placement: z.enum(["HERO", "SIDEBAR_1", "SIDEBAR_2"]).optional(),
  isActive: z.boolean().optional(),
});
