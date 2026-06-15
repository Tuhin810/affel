import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";
import { ProductService } from "../services/product.service";
import { createProductSchema } from "../validators/create-product.validator";
import { updateProductSchema } from "../validators/update-product.validator";
import { listProductsSchema } from "../validators/list-products.validator";
import logger from "../../../config/logger";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async list(req: Request, res: Response): Promise<void> {
    const parsed = listProductsSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const result = await this.productService.listProducts(parsed.data);
    logger.info("Product list request completed", { total: result.pagination.total });

    res.status(200).json(
      ApiResponse.success(result, "Products fetched successfully")
    );
  }

  async create(req: Request, res: Response): Promise<void> {
    logger.info("Product create request received", { name: req.body?.name });

    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const product = await this.productService.create(parsed.data);
    logger.info("Product create request completed", { id: product.id });

    res.status(201).json(
      ApiResponse.success(product, "Product created successfully")
    );
  }

  async getAllActive(req: Request, res: Response): Promise<void> {
    const category = req.query.category ? String(req.query.category) : undefined;
    const platformName = req.query.platformName ? String(req.query.platformName) : undefined;
    
    let categoryIds: string[] | undefined = undefined;
    if (req.query.categoryIds) {
      if (Array.isArray(req.query.categoryIds)) {
        categoryIds = req.query.categoryIds.map(String);
      } else {
        categoryIds = String(req.query.categoryIds).split(",").map((id) => id.trim());
      }
    }

    logger.info("Product list active request received", { category, platformName, categoryIds });

    const products = await this.productService.getAllActive({ category, platformName, categoryIds });
    logger.info("Product list active request completed", { count: products.length });

    res.status(200).json(
      ApiResponse.success(products, "Active products fetched successfully")
    );
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    logger.info("Category list request received");
    const categories = await this.productService.getAllCategories();
    logger.info("Category list request completed", { count: categories.length });

    res.status(200).json(
      ApiResponse.success(categories, "Categories fetched successfully")
    );
  }

  async getAllAdmin(req: Request, res: Response): Promise<void> {
    logger.info("Product list admin request received");

    const products = await this.productService.getAllAdmin();
    logger.info("Product list admin request completed", { count: products.length });

    res.status(200).json(
      ApiResponse.success(products, "All products fetched successfully for admin")
    );
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Product get by id request received", { id });

    const product = await this.productService.getActiveById(id);
    logger.info("Product get by id request completed", { id: product.id });

    res.status(200).json(
      ApiResponse.success(product, "Product fetched successfully")
    );
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Product update request received", { id, fields: Object.keys(req.body ?? {}) });

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const product = await this.productService.update(id, parsed.data);
    logger.info("Product update request completed", { id: product.id });

    res.status(200).json(
      ApiResponse.success(product, "Product updated successfully")
    );
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Product delete request received", { id });

    await this.productService.delete(id);
    logger.info("Product delete request completed", { id });

    res.status(200).json(
      ApiResponse.success(null, "Product deleted successfully")
    );
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}
