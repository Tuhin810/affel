import { Router } from "express";
import { bannerController } from "../banner.module";
import { asyncHandler } from "../../../common/utils/async-handler";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorize } from "../../../middleware/authorize.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  asyncHandler(bannerController.getAllActive.bind(bannerController))
);

router.get(
  "/:id",
  asyncHandler(bannerController.getById.bind(bannerController))
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(bannerController.create.bind(bannerController))
);

router.get(
  "/admin/all",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(bannerController.getAllAdmin.bind(bannerController))
);

router.patch(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(bannerController.update.bind(bannerController))
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(bannerController.delete.bind(bannerController))
);

export default router;
