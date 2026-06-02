import { Response } from "express";

import { HTTP_STATUS } from "../../common/constants/http-status.constants";

export abstract class BaseController {
  protected success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  protected created<T>(
    res: Response,
    message: string,
    data?: T
  ): void {
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message,
      data,
    });
  }
}