import { Request,
         Response,
         NextFunction }
from "express";

import { AppError }
from "../common/errors/app.error";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  if (
    error instanceof AppError
  ) {

    res.status(
      error.statusCode
    ).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message:
      "Internal Server Error",
  });
};
