import { Request, Response } from "express";
import { ZodError } from "zod";
import { AffiliateLinkService } from "../services/affiliate-link.service";
import { createAffiliateLinkSchema, updateAffiliateLinkSchema } from "../validators/affiliate-link.validator";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";

export class AffiliateLinkController {
  private service = new AffiliateLinkService();

  public async create(req: Request, res: Response): Promise<void> {
    const parsed = createAffiliateLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const createdBy = (req as any).user?.userId || null;
    const link = await this.service.createLink({ ...parsed.data, createdBy });
    res.status(201).json(ApiResponse.success(link, "Affiliate link created successfully"));
  }

  public async get(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const link = await this.service.getLink(id);
    if (!link) {
      throw new AppError("Affiliate link not found", 404);
    }
    res.status(200).json(ApiResponse.success(link, "Affiliate link details fetched successfully"));
  }

  public async list(req: Request, res: Response): Promise<void> {
    const entityType = req.query.entityType ? String(req.query.entityType) : undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;

    const links = await this.service.listLinks({ entityType, isActive });
    res.status(200).json(ApiResponse.success(links, "Affiliate links fetched successfully"));
  }

  public async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const parsed = updateAffiliateLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const link = await this.service.updateLink(id, parsed.data);
    res.status(200).json(ApiResponse.success(link, "Affiliate link updated successfully"));
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    await this.service.deleteLink(id);
    res.status(200).json(ApiResponse.success(null, "Affiliate link deleted successfully"));
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}

export const affiliateLinkController = new AffiliateLinkController();
export default affiliateLinkController;
