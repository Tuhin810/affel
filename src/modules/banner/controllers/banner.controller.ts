import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";
import { BannerService } from "../services/banner.service";
import { createBannerSchema } from "../validators/create-banner.validator";
import { updateBannerSchema } from "../validators/update-banner.validator";
import logger from "../../../config/logger";

export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  async create(req: Request, res: Response): Promise<void> {
    logger.info("Banner create request received", { title: req.body?.title });

    const parsed = createBannerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const banner = await this.bannerService.create(parsed.data);
    logger.info("Banner create request completed", { id: banner.id });

    res.status(201).json(
      ApiResponse.success(banner, "Banner created successfully")
    );
  }

  async getAllActive(req: Request, res: Response): Promise<void> {
    const placement = req.query.placement ? String(req.query.placement) : undefined;
    logger.info("Banner list active request received", { placement });

    const banners = await this.bannerService.getAllActive(placement);
    logger.info("Banner list active request completed", { count: banners.length });

    res.status(200).json(
      ApiResponse.success(banners, "Active banners fetched successfully")
    );
  }

  async getAllAdmin(req: Request, res: Response): Promise<void> {
    logger.info("Banner list admin request received");

    const banners = await this.bannerService.getAllAdmin();
    logger.info("Banner list admin request completed", { count: banners.length });

    res.status(200).json(
      ApiResponse.success(banners, "All banners fetched successfully for admin")
    );
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Banner get by id request received", { id });

    const banner = await this.bannerService.getActiveById(id);
    logger.info("Banner get by id request completed", { id: banner.id });

    res.status(200).json(
      ApiResponse.success(banner, "Banner fetched successfully")
    );
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Banner update request received", { id, fields: Object.keys(req.body ?? {}) });

    const parsed = updateBannerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const banner = await this.bannerService.update(id, parsed.data);
    logger.info("Banner update request completed", { id: banner.id });

    res.status(200).json(
      ApiResponse.success(banner, "Banner updated successfully")
    );
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Banner delete request received", { id });

    await this.bannerService.delete(id);
    logger.info("Banner delete request completed", { id });

    res.status(200).json(
      ApiResponse.success(null, "Banner deleted successfully")
    );
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}
