import { Request,
         Response,
         NextFunction }
from "express";

import { AppError }
from "../common/errors/app.error";

import logger from "../config/logger";

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  logger.error(
    "Request failed",
    {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: error.stack,
    }
  );

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
