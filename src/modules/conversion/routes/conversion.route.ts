import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorize.middleware";
import { asyncHandler } from "../../../common/utils/async-handler";
import { conversionController } from "../controllers/conversion.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(conversionController.create.bind(conversionController))
);

router.post(
  "/import",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(conversionController.importConversions.bind(conversionController))
);

export default router;
