import {
  Request,
  Response,
  NextFunction
} from "express";

import { AppError }
from "../common/errors/app.error";

import { jwtService }
from "../modules/auth/auth.module";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith(
      "Bearer "
    )
  ) {

    throw new AppError(
      "Unauthorized",
      401
    );

  }

  const token =
    authHeader.split(" ")[1];

  try {

    const payload =
      jwtService.verifyAccessToken(
        token
      );

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();

  } catch {

    throw new AppError(
      "Invalid token",
      401
    );

  }
};