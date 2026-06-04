import { Router }
from "express";

import { AuthController }
from "../controllers/auth.controller";

const router = Router();

const authController =
  new AuthController();

router.post(
  "/send-email-otp",
  authController.sendEmailOtp
);

router.post(
  "/verify-email-otp",
  authController.verifyEmailOtp
);

export default router;