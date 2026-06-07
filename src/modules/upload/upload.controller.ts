import { Request, Response } from "express";
import { ZodError } from "zod";

import { ApiResponse } from "../../common/utils/api-response";
import { AppError } from "../../common/errors/app.error";

import { uploadService } from "./upload.service";
import { generateSignatureSchema } from "./upload.schema";

class UploadController {
  generateSignature(
    req: Request,
    res: Response
  ): void {
    const parsed =
      generateSignatureSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      throw new AppError(
        this.formatValidationError(
          parsed.error
        ),
        400
      );
    }

    const result =
      uploadService.generateSignature(
        parsed.data.folder
      );

    res.status(200).json(
      ApiResponse.success(
        result,
        "Upload signature generated"
      )
    );
  }

  private formatValidationError(
    error: ZodError
  ): string {
    return error.issues
      .map((issue) => issue.message)
      .join(", ");
  }

}

export const uploadController =
  new UploadController();
