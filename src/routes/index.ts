import { Router }
from "express";

import authRoutes
from "../modules/auth/routes/auth.routes";
import merchantRoutes
from "../modules/merchant/routes/merchant.route";
import uploadRoutes
from "../modules/upload/upload.routes";

import bannerRoutes
from "../modules/banner/routes/banner.route";
import productRoutes
from "../modules/product/routes/product.route";
import trackingRoutes
from "../modules/tracking/routes/tracking.route";
import webhookRoutes
from "../modules/conversion/routes/webhook.route";
import walletRoutes
from "../modules/wallet/routes/wallet.route";
import analyticsRoutes
from "../modules/analytics/routes/analytics.route";

const router = Router();

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/merchant",merchantRoutes
);

router.use(
  "/uploads",
  uploadRoutes
);

router.use(
  "/banner",
  bannerRoutes
);

router.use(
  "/product",
  productRoutes
);

router.use(
  "/tracking",
  trackingRoutes
);

router.use(
  "/webhooks",
  webhookRoutes
);

router.use(
  "/wallet",
  walletRoutes
);

router.use(
  "/analytics",
  analyticsRoutes
);

export default router;
