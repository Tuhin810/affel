import { Router } from "express";

import { merchantController } from "../merchant.module";

import { asyncHandler } from "../../../common/utils/async-handler";

import { authMiddleware } from "../../../middleware/auth.middleware";

import {
  authorize
} from "../../../middleware/authorize.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  asyncHandler(
    merchantController.getAll.bind(merchantController)
  )
);

router.get(
  "/slug/:slug",
  asyncHandler(
    merchantController.getBySlug.bind(merchantController)
  )
);

router.get(
  "/:id",
  asyncHandler(
    merchantController.getById.bind(merchantController)
  )
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
  asyncHandler(
    merchantController.create.bind(merchantController)
  )
);

router.patch(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(
    merchantController.update.bind(merchantController)
  )
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(
    merchantController.delete.bind(merchantController)
  )
);

export default router;