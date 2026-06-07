import { Router } from "express";

import { asyncHandler } from "../../common/utils/async-handler";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";

import { uploadController } from "./upload.controller";

const router = Router();

router.post(
  "/signature",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(
    uploadController.generateSignature.bind(
      uploadController
    )
  )
);
export default router;
