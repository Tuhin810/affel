import { Request, Response } from "express";
import { ZodError } from "zod";

import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";
import { MerchantService } from "../services/merchant.service";
import { createMerchantSchema } from "../validators/create-merchant.validator";
import { updateMerchantSchema } from "../validators/update-merchant.validator";
import logger from "../../../config/logger";

export class MerchantController {
  constructor(
    private merchantService: MerchantService
  ) {}

  async create(
    req: Request,
    res: Response
  ): Promise<void> {
    logger.info(
      "Merchant create request received",
      {
        slug: req.body?.slug,
        name: req.body?.name,
      }
    );

    const parsed =
      createMerchantSchema.safeParse(
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

    const merchant =
      await this.merchantService.create(
        parsed.data
      );

    logger.info(
      "Merchant create request completed",
      {
        id: merchant.id,
        slug: merchant.slug,
      }
    );

    res.status(201).json(
      ApiResponse.success(
        merchant,
        "Merchant created successfully"
      )
    );
  }

  async getAll(
    req: Request,
    res: Response
  ): Promise<void> {
    logger.info(
      "Merchant list request received"
    );

    const merchants =
      await this.merchantService.getAll();

    logger.info(
      "Merchant list request completed",
      {
        count: merchants.length,
      }
    );

    res.status(200).json(
      ApiResponse.success(
        merchants,
        "Merchants fetched successfully"
      )
    );
  }

  async getById(
    req: Request,
    res: Response
  ): Promise<void> {
    const id =
      String(req.params.id);

    logger.info(
      "Merchant get by id request received",
      {
        id,
      }
    );

    const merchant =
      await this.merchantService.getById(
        id,
      );

    logger.info(
      "Merchant get by id request completed",
      {
        id: merchant.id,
        slug: merchant.slug,
      }
    );

    res.status(200).json(
      ApiResponse.success(
        merchant,
        "Merchant fetched successfully"
      )
    );
  }

  async getBySlug(
    req: Request,
    res: Response
  ): Promise<void> {
    const slug =
      String(req.params.slug);

    logger.info(
      "Merchant get by slug request received",
      {
        slug,
      }
    );

    const merchant =
      await this.merchantService.getBySlug(
        slug,
      );

    logger.info(
      "Merchant get by slug request completed",
      {
        id: merchant.id,
        slug: merchant.slug,
      }
    );

    res.status(200).json(
      ApiResponse.success(
        merchant,
        "Merchant fetched successfully"
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

  async update(
    req: Request,
    res: Response
  ): Promise<void> {
    const id =
      String(req.params.id);

    logger.info(
      "Merchant update request received",
      {
        id,
        fields: Object.keys(req.body ?? {}),
      }
    );

    const parsed =
      updateMerchantSchema.safeParse(
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

    const merchant =
      await this.merchantService.updateMerchant(
        id,
        parsed.data
      );

    logger.info(
      "Merchant update request completed",
      {
        id: merchant.id,
        slug: merchant.slug,
      }
    );

    res.status(200).json(
      ApiResponse.success(
        merchant,
        "Merchant updated successfully"
      )
    );
  }

  async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    const id =
      String(req.params.id);

    logger.info(
      "Merchant delete request received",
      {
        id,
      }
    );

    await this.merchantService.delete(
      id
    );

    logger.info(
      "Merchant delete request completed",
      {
        id,
      }
    );

    res.status(200).json(
      ApiResponse.success(
        null,
        "Merchant deleted successfully"
      )
    );
  }
}
