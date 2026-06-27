import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../common/utils/async-handler";

const router = Router();

/**
 * @swagger
 * /api/v1/wallet/balance:
 *   get:
 *     summary: Get current wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/balance",
  authMiddleware,
  asyncHandler(walletController.getBalance.bind(walletController))
);

/**
 * @swagger
 * /api/v1/wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  "/transactions",
  authMiddleware,
  asyncHandler(walletController.getTransactions.bind(walletController))
);

export default router;
