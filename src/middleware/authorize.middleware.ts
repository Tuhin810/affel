import {
  Request,
  Response,
  NextFunction
} from "express";

import { AppError }
from "../common/errors/app.error";

export const authorize =
  (
    roles: string[]
  ) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    if (!req.user) {

      throw new AppError(
        "Unauthorized",
        401
      );

    }

    if (
      !roles.includes(
        req.user.role
      )
    ) {

      throw new AppError(
        "Forbidden",
        403
      );

    }

    next();
  };