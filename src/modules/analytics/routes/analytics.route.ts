import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorize.middleware";
import { asyncHandler } from "../../../common/utils/async-handler";

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     summary: Retrieve aggregate performance overview metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/overview",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(analyticsController.getOverview.bind(analyticsController))
);

/**
 * @swagger
 * /api/v1/analytics/entity/{type}:
 *   get:
 *     summary: Retrieve click and conversion performance for a specific entity type
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PRODUCT, MERCHANT, BANNER, CATEGORY]
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/entity/:type",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(analyticsController.getEntityReport.bind(analyticsController))
);

/**
 * @swagger
 * /api/v1/analytics/campaigns:
 *   get:
 *     summary: Retrieve performance metrics grouped by campaign ID
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/campaigns",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(analyticsController.getCampaignReport.bind(analyticsController))
);

export default router;
