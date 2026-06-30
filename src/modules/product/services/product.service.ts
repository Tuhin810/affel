import { AppError } from "../../../common/errors/app.error";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ListProductsInput } from "../validators/list-products.validator";
import { ProductRepository } from "../repositories/product.repository";
import logger from "../../../config/logger";

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto) {
    logger.info("Creating product service call", { name: dto.name });

    // Validate category IDs
    await this.validateCategoryIds(dto.categoryIds);

    // Validate image URLs and public IDs
    this.validateImages(dto.imageUrls, dto.imagePublicIds);

    const product = await this.productRepository.create(dto);
    logger.info("Product created successfully in service", { id: product.id });
    return product;
  }

  async getAllActive(filters?: { category?: string; categoryIds?: string[] }) {
    logger.info("Fetching active products service call", filters);
    return this.productRepository.findAllActive(filters);
  }

  async getAllAdmin(params?: { page?: number; limit?: number; search?: string }) {
    logger.info("Fetching all products for admin service call", { params });

    const page = params?.page;
    const limit = params?.limit;
    const search = params?.search;

    if (page === undefined) {
      return this.productRepository.findAllAdmin(search);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.productRepository.findAdminProductsPaginated({
      page: pageNum,
      limit: limitNum,
      search,
    });
  }

  async getById(id: string) {
    logger.info("Fetching product by id service call", { id });
    const product = await this.productRepository.findById(id);

    if (!product || product.isDeleted) {
      logger.warn("Product not found or deleted", { id });
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async getActiveById(id: string) {
    logger.info("Fetching active product by id service call", { id });
    const product = await this.productRepository.findActiveById(id);

    if (!product) {
      logger.warn("Active product not found", { id });
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    logger.info("Updating product service call", { id });

    const existing = await this.productRepository.findById(id);
    if (!existing || existing.isDeleted) {
      logger.warn("Product to update not found or deleted", { id });
      throw new AppError("Product not found", 404);
    }

    // Validate category IDs if provided
    if (dto.categoryIds !== undefined) {
      await this.validateCategoryIds(dto.categoryIds);
    }

    // Merge or validate fields if provided
    const urlsToValidate = dto.imageUrls !== undefined ? dto.imageUrls : existing.imageUrls;
    const publicIdsToValidate = dto.imagePublicIds !== undefined ? dto.imagePublicIds : existing.imagePublicIds;
    
    if (dto.imageUrls !== undefined || dto.imagePublicIds !== undefined) {
      this.validateImages(urlsToValidate, publicIdsToValidate);
    }

    const updated = await this.productRepository.update(id, dto);
    logger.info("Product updated successfully in service", { id: updated.id });
    return updated;
  }

  async delete(id: string) {
    logger.info("Deleting product service call", { id });

    const existing = await this.productRepository.findById(id);
    if (!existing || existing.isDeleted) {
      logger.warn("Product to delete not found or deleted", { id });
      throw new AppError("Product not found", 404);
    }

    await this.productRepository.softDelete(id);
    logger.info("Product soft deleted successfully", { id });
  }

  async getAllCategories(params?: { page?: number; limit?: number; search?: string }) {
    logger.info("Fetching all categories service call", { params });

    const page = params?.page;
    const limit = params?.limit;
    const search = params?.search;

    if (page === undefined) {
      return this.productRepository.findAllCategories(search);
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    return this.productRepository.findCategoriesPaginated({
      page: pageNum,
      limit: limitNum,
      search,
    });
  }

  async listProducts(params: ListProductsInput) {
    logger.info("Product listing service call", { params });
    return this.productRepository.listProducts(params);
  }

  private async validateCategoryIds(categoryIds: string[]): Promise<void> {
    if (categoryIds.length === 0) {
      throw new AppError("At least one category is required", 400);
    }
    const count = await this.productRepository.countCategoriesByIds(categoryIds);
    if (count !== categoryIds.length) {
      throw new AppError("One or more category IDs are invalid", 400);
    }
  }

  private validateImages(imageUrls: string[], imagePublicIds?: string[]): void {
    if (imageUrls.length === 0) {
      throw new AppError("At least one product image is required", 400);
    }
    if (imageUrls.length > 6) {
      throw new AppError("Maximum 6 product images allowed", 400);
    }

    for (const urlStr of imageUrls) {
      try {
        const parsedUrl = new URL(urlStr);
        if (parsedUrl.hostname !== "res.cloudinary.com") {
          throw new AppError("Invalid image URL: Must be a Cloudinary URL", 400);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Invalid image URL format", 400);
      }
    }

    if (imagePublicIds) {
      if (imagePublicIds.length > imageUrls.length) {
        throw new AppError("Number of public IDs cannot exceed number of image URLs", 400);
      }
      for (const publicId of imagePublicIds) {
        if (!publicId.startsWith("products/")) {
          throw new AppError("Invalid imagePublicId: Must start with products/", 400);
        }
      }
    }
  }

  async createCategory(dto: { name: string; slug?: string }) {
    logger.info("Creating category service call", { name: dto.name });

    const slug = dto.slug ? dto.slug.trim().toLowerCase() : this.slugify(dto.name);

    // Check duplicate name
    const existingName = await this.productRepository.findCategoryByName(dto.name);
    if (existingName) {
      throw new AppError("Category name already exists", 400);
    }

    // Check duplicate slug
    const existingSlug = await this.productRepository.findCategoryBySlug(slug);
    if (existingSlug) {
      throw new AppError("Category slug already exists", 400);
    }

    return this.productRepository.createCategory({ name: dto.name, slug });
  }

  async updateCategory(id: string, dto: { name?: string; slug?: string }) {
    logger.info("Updating category service call", { id, name: dto.name, slug: dto.slug });

    const existing = await this.productRepository.findCategoryById(id);
    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    const updatedData: { name?: string; slug?: string } = {};

    if (dto.name !== undefined) {
      if (dto.name !== existing.name) {
        const existingName = await this.productRepository.findCategoryByName(dto.name);
        if (existingName) {
          throw new AppError("Category name already exists", 400);
        }
      }
      updatedData.name = dto.name;
    }

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (slug !== existing.slug) {
        const existingSlug = await this.productRepository.findCategoryBySlug(slug);
        if (existingSlug) {
          throw new AppError("Category slug already exists", 400);
        }
      }
      updatedData.slug = slug;
    } else if (dto.name !== undefined && dto.name !== existing.name) {
      // Re-generate slug if name changed but slug wasn't explicitly provided
      const slug = this.slugify(dto.name);
      if (slug !== existing.slug) {
        const existingSlug = await this.productRepository.findCategoryBySlug(slug);
        if (existingSlug) {
          throw new AppError("Category slug already exists", 400);
        }
      }
      updatedData.slug = slug;
    }

    return this.productRepository.updateCategory(id, updatedData);
  }

  async deleteCategory(id: string) {
    logger.info("Deleting category service call", { id });

    const existing = await this.productRepository.findCategoryById(id);
    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    const productCount = await this.productRepository.countCategoryProducts(id);
    if (productCount > 0) {
      throw new AppError("Cannot delete category because it is associated with products", 400);
    }

    return this.productRepository.deleteCategory(id);
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }
}
export default ProductService;
