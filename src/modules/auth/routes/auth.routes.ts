import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../../../common/utils/async-handler";
import { authMiddleware } from "../../../middleware/auth.middleware";
const router = Router();

const authController = new AuthController();

router.post(
  "/send-email-otp",
  asyncHandler(authController.sendEmailOtp.bind(authController))
);

router.post(
  "/verify-email-otp",
  asyncHandler(authController.verifyEmailOtp.bind(authController))
);

router.post(
  "/register",
  asyncHandler(authController.register.bind(authController))
);

router.post(
  "/send-login-otp",
  asyncHandler(authController.sendLoginOtp.bind(authController))
);

router.post(
  "/verify-login-otp",
  asyncHandler(authController.verifyLoginOtp.bind(authController))
);

router.post(
  "/auth/logout",
  asyncHandler(authController.logout)
)

router.get(
  "/me",
  authMiddleware,
  asyncHandler(
    authController.me
  )
);



export default router;