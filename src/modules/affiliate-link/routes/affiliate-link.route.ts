import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorize.middleware";
import { asyncHandler } from "../../../common/utils/async-handler";
import { affiliateLinkController } from "../controllers/affiliate-link.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(affiliateLinkController.create.bind(affiliateLinkController))
);

router.get(
  "/",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(affiliateLinkController.list.bind(affiliateLinkController))
);

router.get(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(affiliateLinkController.get.bind(affiliateLinkController))
);

router.put(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(affiliateLinkController.update.bind(affiliateLinkController))
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(affiliateLinkController.delete.bind(affiliateLinkController))
);

export default router;
