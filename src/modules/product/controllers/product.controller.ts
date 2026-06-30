import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";
import { ProductService } from "../services/product.service";
import { createProductSchema } from "../validators/create-product.validator";
import { updateProductSchema } from "../validators/update-product.validator";
import { listProductsSchema } from "../validators/list-products.validator";
import { createCategorySchema } from "../validators/create-category.validator";
import { updateCategorySchema } from "../validators/update-category.validator";
import { searchSchema } from "../validators/search.validator";
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
    
    let categoryIds: string[] | undefined = undefined;
    if (req.query.categoryIds) {
      if (Array.isArray(req.query.categoryIds)) {
        categoryIds = req.query.categoryIds.map(String);
      } else {
        categoryIds = String(req.query.categoryIds).split(",").map((id) => id.trim());
      }
    }

    logger.info("Product list active request received", { category, categoryIds });

    const products = await this.productService.getAllActive({ category, categoryIds });
    logger.info("Product list active request completed", { count: products.length });

    res.status(200).json(
      ApiResponse.success(products, "Active products fetched successfully")
    );
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    logger.info("Category list request received", { page, limit, search });
    const result = await this.productService.getAllCategories({ page, limit, search });
    
    const count = Array.isArray(result) ? result.length : result.categories.length;
    logger.info("Category list request completed", { count });

    res.status(200).json(
      ApiResponse.success(result, "Categories fetched successfully")
    );
  }

  async getAllAdmin(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    logger.info("Product list admin request received", { page, limit, search });

    const result = await this.productService.getAllAdmin({ page, limit, search });
    
    const count = Array.isArray(result) ? result.length : result.products.length;
    logger.info("Product list admin request completed", { count });

    res.status(200).json(
      ApiResponse.success(result, "All products fetched successfully for admin")
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

  async createCategory(req: Request, res: Response): Promise<void> {
    logger.info("Category create request received", { name: req.body?.name });

    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const category = await this.productService.createCategory(parsed.data);
    logger.info("Category create request completed", { id: category.id });

    res.status(201).json(
      ApiResponse.success(category, "Category created successfully")
    );
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Category update request received", { id, name: req.body?.name });

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const category = await this.productService.updateCategory(id, parsed.data);
    logger.info("Category update request completed", { id: category.id });

    res.status(200).json(
      ApiResponse.success(category, "Category updated successfully")
    );
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    logger.info("Category delete request received", { id });

    await this.productService.deleteCategory(id);
    logger.info("Category delete request completed", { id });

    res.status(200).json(
      ApiResponse.success(null, "Category deleted successfully")
    );
  }

  async search(req: Request, res: Response): Promise<void> {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    logger.info("Search request received", { params: parsed.data });
    const result = await this.productService.search(parsed.data);
    logger.info("Search request completed", { type: parsed.data.type });

    res.status(200).json(
      ApiResponse.success(result, "Search results fetched successfully")
    );
  }

  async bulkCreateCategories(req: Request, res: Response): Promise<void> {
    logger.info("Category bulk create request received");

    const { names } = req.body;
    if (!names || !Array.isArray(names)) {
      throw new AppError("Invalid input: names must be an array of strings", 400);
    }

    const result = await this.productService.bulkCreateCategories(names);
    logger.info("Category bulk create completed", { createdCount: result.createdCount });

    res.status(201).json(
      ApiResponse.success(result, "Bulk categories created successfully")
    );
  }

  async bulkDeleteCategories(req: Request, res: Response): Promise<void> {
    logger.info("Category bulk delete request received");

    const result = await this.productService.bulkDeleteCategories();
    logger.info("Category bulk delete completed", { deletedCount: result.deletedCount });

    res.status(200).json(
      ApiResponse.success(result, "Bulk categories deleted successfully")
    );
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}
