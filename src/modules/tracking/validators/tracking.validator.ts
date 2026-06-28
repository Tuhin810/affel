import { z } from "zod";

export const trackClickSchema = z.object({
  userId: z.string().uuid("User ID must be a valid UUID").optional(),
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string().min(1, "Entity ID is required"),
  campaignId: z.string().optional(),
  Device: z.string().optional(),
  Browser: z.string().optional(),
  IP: z.string().optional(),
  ReferralCode: z.string().optional(),
  redirect: z.boolean().optional(),
});
