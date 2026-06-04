import { Router }
from "express";

import authRoutes
from "../modules/auth/routes/auth.routes";
import merchantRoutes
from "../modules/routes/merchant.route";

const router = Router();

router.use(
  "/auth",
  authRoutes
);

router.use(
  "merchant",merchantRoutes
);

export default router;