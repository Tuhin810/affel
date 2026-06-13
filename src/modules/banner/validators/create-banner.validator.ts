import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  offerTitle: z.string().optional(),
  link: z.string().optional(),
  placement: z.enum(["HERO", "SIDEBAR_1", "SIDEBAR_2"]).optional(),
  isActive: z.boolean().optional(),
});
