import { Router }
from "express";

import authRoutes
from "../modules/auth/routes/auth.routes";
import merchantRoutes
from "../modules/routes/merchant.route";
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
