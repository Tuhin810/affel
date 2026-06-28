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
import conversionRoutes
from "../modules/conversion/routes/conversion.route";
import walletRoutes
from "../modules/wallet/routes/wallet.route";
import analyticsRoutes
from "../modules/analytics/routes/analytics.route";
import affiliateLinkRoutes
from "../modules/affiliate-link/routes/affiliate-link.route";

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
  "/conversion",
  conversionRoutes
);

router.use(
  "/wallet",
  walletRoutes
);

router.use(
  "/analytics",
  analyticsRoutes
);

router.use(
  "/affiliate-link",
  affiliateLinkRoutes
);

export default router;
