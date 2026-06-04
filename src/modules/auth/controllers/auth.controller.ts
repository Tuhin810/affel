import { Request, Response }
from "express";

import { authService }
from "../auth.module";

export class AuthController {

  async sendEmailOtp(
    req: Request,
    res: Response
  ): Promise<void> {

    const { email } = req.body;

    await authService.sendEmailOtp(
      email
    );

    res.status(200).json({
      success: true,
      message:
        "OTP sent successfully",
    });
  }

  async verifyEmailOtp(
  req: Request,
  res: Response
): Promise<void> {

  const {
    email,
    otp
  } = req.body;

  await authService.verifyEmailOtp(
    email,
    otp
  );

  res.status(200).json({
    success: true,
    message:
      "OTP verified successfully",
  });
}
}