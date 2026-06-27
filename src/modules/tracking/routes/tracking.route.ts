import { Router } from "express";
import { trackingController } from "../controllers/tracking.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../common/utils/async-handler";

const router = Router();

/**
 * @swagger
 * /api/v1/tracking/click:
 *   post:
 *     summary: Record a tracking click and get redirect URL
 *     tags: [Tracking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, entityId]
 *             properties:
 *               userId:
 *                 type: string
 *               entityType:
 *                 type: string
 *                 enum: [PRODUCT, MERCHANT, BANNER, CATEGORY, OFFER, CAMPAIGN]
 *               entityId:
 *                 type: string
 *               productSourceId:
 *                 type: string
 *               merchantId:
 *                 type: string
 *               campaignId:
 *                 type: string
 *               redirect:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Click tracked successfully
 */
router.post(
  "/click",
  (req, res, next) => {
    // If authorization header is present, run authMiddleware. Otherwise, bypass and use body.userId.
    if (req.headers.authorization) {
      return authMiddleware(req, res, next);
    }
    next();
  },
  asyncHandler(trackingController.trackClick.bind(trackingController))
);

/**
 * @swagger
 * /api/v1/tracking/history:
 *   get:
 *     summary: Retrieve user click history
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/history",
  authMiddleware,
  asyncHandler(trackingController.getHistory.bind(trackingController))
);

/**
 * @swagger
 * /api/v1/tracking/{clickId}:
 *   get:
 *     summary: Get details of a single click record
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: clickId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/:clickId",
  asyncHandler(trackingController.getClick.bind(trackingController))
);

export default router;
