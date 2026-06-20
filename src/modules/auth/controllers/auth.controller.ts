import { Request, Response }
  from "express";

import { authService }
  from "../auth.module";

import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";

export class AuthController {

  async sendEmailOtp(
    req: Request,
    res: Response
  ): Promise<void> {

    const { email } = req.body;

    await authService.sendEmailOtp(
      email
    );

    res.status(200).json(
      ApiResponse.success(null, "OTP sent successfully")
    );
  }

  async verifyEmailOtp(
    req: Request,
    res: Response
  ): Promise<void> {

    const {
      email,
      otp
    } = req.body;

    const verificationToken =
      await authService.verifyEmailOtp(
        email,
        otp
      );

    res.status(200).json(
      ApiResponse.success({ verificationToken }, "OTP verified successfully")
    );
  }

  async register(
    req: Request,
    res: Response
  ): Promise<void> {

    const result =
      await authService.register(
        req.body
      );

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken, ...responseBody } = result;

    res.status(201).json(
      ApiResponse.success(responseBody, "User registered successfully")
    );
  }

  async sendLoginOtp(
    req: Request,
    res: Response
  ): Promise<void> {

    const { email } = req.body;

    await authService.sendLoginOtp(
      email
    );

    res.status(200).json(
      ApiResponse.success(null, "Login OTP sent successfully")
    );
  }

  async verifyLoginOtp(
    req: Request,
    res: Response
  ): Promise<void> {

    const {
      email,
      otp
    } = req.body;

    const result =
      await authService.verifyLoginOtp(
        email,
        otp
      );

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken, ...responseBody } = result;

    res.status(200).json(
      ApiResponse.success(responseBody, "Login successful")
    );
  }

  async refreshToken(
    req: Request,
    res: Response
  ): Promise<void> {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await authService.refreshToken(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken: _, ...responseBody } = result;

    res.status(200).json(
      ApiResponse.success(responseBody, "Token refreshed successfully")
    );
  }

  async logout(
    req: Request,
    res: Response
  ): Promise<void> {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    });

    res.status(200).json(
      ApiResponse.success(null, "Logged out successfully")
    );
  }

  async logoutAll(
    req: Request,
    res: Response
  ): Promise<void> {

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not found in request", 401);
    }

    await authService.logoutAll(userId);

    res.status(200).json(
      ApiResponse.success(null, "Logged out from all devices successfully")
    );
  }

  async me(
    req: Request,
    res: Response
  ): Promise<void> {

    const user =
      await authService.me(
        req.user!.userId
      );

    res.status(200).json(
      ApiResponse.success(
        user,
        "Profile fetched"
      )
    );
  }
}