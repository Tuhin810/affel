import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller";
import { asyncHandler } from "../../../common/utils/async-handler";

const router = Router();

/**
 * @swagger
 * /api/v1/webhooks/cuelinks:
 *   post:
 *     summary: Handle Cuelinks conversion webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/cuelinks", asyncHandler(webhookController.cuelinks.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/admitad:
 *   post:
 *     summary: Handle Admitad conversion webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/admitad", asyncHandler(webhookController.admitad.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/impact:
 *   post:
 *     summary: Handle Impact conversion webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/impact", asyncHandler(webhookController.impact.bind(webhookController)));

export default router;
