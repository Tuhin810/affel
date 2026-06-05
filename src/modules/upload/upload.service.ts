import cloudinary from "../../config/cloudinary";
import { AppError } from "../../common/errors/app.error";

import { UploadFolder } from "./upload.types";

class UploadService {
  generateSignature(
    folder: UploadFolder
  ) {
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      throw new AppError(
        "Cloudinary credentials are not configured",
        500
      );
    }

    const timestamp =
      Math.round(
        new Date().getTime() / 1000
      );

    const signature =
      cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        apiSecret
      );

    return {
      timestamp,
      signature,
      cloudName,
      apiKey,
      folder,
    };
  }
}

export const uploadService =
  new UploadService();
