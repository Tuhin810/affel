import { Request, Response } from "express";

import { ApiResponse } from "../../../common/utils/api-response";
import { MerchantService } from "../services/merchant.service";

export class MerchantController {
  constructor(
    private merchantService: MerchantService
  ) {}

  async create(
    req: Request,
    res: Response
  ): Promise<void> {
    const merchant =
      await this.merchantService.create(
        req.body
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
    const merchants =
      await this.merchantService.getAll();

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
    const merchant =
      await this.merchantService.getById(
        String(req.params.id),
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
    const merchant =
      await this.merchantService.getBySlug(
        String(req.params.slug),
      );

    res.status(200).json(
      ApiResponse.success(
        merchant,
        "Merchant fetched successfully"
      )
    );
  }

  async update(
    req: Request,
    res: Response
  ): Promise<void> {
    const merchant =
      await this.merchantService.update(
        String(req.params.id),
        req.body
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
    await this.merchantService.delete(
      String(req.params.id)
    );

    res.status(200).json(
      ApiResponse.success(
        null,
        "Merchant deleted successfully"
      )
    );
  }
}