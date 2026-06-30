import { Router } from "express";
import { productController } from "../product.module";
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
  asyncHandler(productController.list.bind(productController))
);

router.get(
  "/categories",
  asyncHandler(productController.getCategories.bind(productController))
);

router.get(
  "/search",
  asyncHandler(productController.search.bind(productController))
);

router.get(
  "/:id",
  asyncHandler(productController.getById.bind(productController))
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
router.post(
  "/categories",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.createCategory.bind(productController))
);

router.patch(
  "/categories/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.updateCategory.bind(productController))
);

router.delete(
  "/categories/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.deleteCategory.bind(productController))
);

router.post(
  "/",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.create.bind(productController))
);

router.get(
  "/admin/all",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.getAllAdmin.bind(productController))
);

router.patch(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.update.bind(productController))
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(["ADMIN"]),
  asyncHandler(productController.delete.bind(productController))
);

export default router;
