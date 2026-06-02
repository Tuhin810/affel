import { NextFunction, Request, Response } from "express";

import { AppError } from "../core/exceptions/AppError";

import { HTTP_STATUS } from "../common/constants/http-status.constants";

import logger from "../config/logger";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
  });
};