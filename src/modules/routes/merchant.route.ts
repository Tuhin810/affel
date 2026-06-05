import { Router } from "express";

import { merchantController } from "../merchant.module";

import { asyncHandler } from "../../common/utils/async-handler";

import { authMiddleware } from "../../middleware/auth.middleware";

import {
  authorize
} from "../../middleware/authorize.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  asyncHandler(
    merchantController.getAll
  )
);

router.get(
  "/slug/:slug",
  asyncHandler(
    merchantController.getBySlug
  )
);

router.get(
  "/:id",
  asyncHandler(
    merchantController.getById
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
    merchantController.create
  )
);

router.patch(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(
    merchantController.update
  )
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(
    merchantController.delete
  )
);

export default router;