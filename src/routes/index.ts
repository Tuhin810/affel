import { Router }
from "express";

import authRoutes
from "../modules/auth/routes/auth.routes";
import merchantRoutes
from "../modules/merchant/routes/merchant.route";
import uploadRoutes
from "../modules/upload/upload.routes";

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

export default router;
