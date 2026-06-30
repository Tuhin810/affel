import { Prisma } from "@prisma/client";
import prisma from "../../../database/prisma/client";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ListProductsInput } from "../validators/list-products.validator";
import logger from "../../../config/logger";

export class ProductRepository {
  async create(data: CreateProductDto) {
    logger.info("Creating product in database", { name: data.name });

    const { categoryIds, ...productData } = data;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...productData,
          imagePublicIds: productData.imagePublicIds || [],
          categories: {
            create: categoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
      return created;
    });

    logger.info("Product created in database with categories", { id: product.id });
    return product;
  }

  async findById(id: string) {
    logger.info("Finding product by id", { id });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    logger.info("Product lookup completed", { id, found: Boolean(product) });
    return product;
  }

  async findActiveById(id: string) {
    logger.info("Finding active product by id", { id });

    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        isDeleted: false,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    logger.info("Active product lookup completed", { id, found: Boolean(product) });
    return product;
  }

  async findAllActive(filters?: { categoryIds?: string[]; category?: string }) {
    logger.info("Finding all active products with filters", filters);

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(filters?.categoryIds && filters.categoryIds.length > 0
          ? {
              categories: {
                some: {
                  categoryId: { in: filters.categoryIds },
                },
              },
            }
          : {}),
        ...(filters?.category
          ? {
              categories: {
                some: {
                  category: {
                    OR: [
                      { name: { equals: filters.category, mode: "insensitive" } },
                      { slug: { equals: filters.category, mode: "insensitive" } },
                    ],
                  },
                },
              },
            }
          : {}),
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info("Active products fetched", { count: products.length });
    return products;
  }

  async findAllAdmin() {
    logger.info("Finding all products for admin");

    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info("All products fetched for admin", { count: products.length });
    return products;
  }

  async update(id: string, data: UpdateProductDto) {
    logger.info("Updating product in database", { id });

    const { categoryIds, ...productData } = data;

    const product = await prisma.$transaction(async (tx) => {
      if (categoryIds !== undefined) {
        logger.info("Replacing categories for product", { id });
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(categoryIds !== undefined
            ? {
                categories: {
                  create: categoryIds.map((categoryId) => ({
                    categoryId,
                  })),
                },
              }
            : {}),
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return updated;
    });

    logger.info("Product updated successfully", { id: product.id });
    return product;
  }

  async softDelete(id: string) {
    logger.info("Soft deleting product", { id });

    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    logger.info("Product soft deleted successfully", { id: product.id });
    return product;
  }

  async findAllCategories() {
    logger.info("Finding all categories in repository");
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async countCategoriesByIds(ids: string[]) {
    return prisma.category.count({
      where: {
        id: { in: ids },
      },
    });
  }

  async listProducts(params: ListProductsInput) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      sort = "newest",
      page,
      limit,
    } = params;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isDeleted: false,

      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),

      ...(category && {
        categories: {
          some: {
            category: {
              slug: { equals: category, mode: "insensitive" },
            },
          },
        },
      }),

      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),

      ...(featured === "true" && {
        isFeatured: true,
      }),
    };

    const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      newest:       { createdAt: "desc" },
      oldest:       { createdAt: "asc" },
      price_asc:    { price: "asc" },
      price_desc:   { price: "desc" },
      cashback_desc:{ cashbackPercentage: "desc" },
      featured:     { isFeatured: "desc" },
    };
    const orderBy = sortMap[sort] ?? { createdAt: "desc" };

    const skip = (page - 1) * limit;

    logger.info("Listing products with filters", { search, category, minPrice, maxPrice, featured, sort, page, limit });

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          categories: {
            include: { category: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info("Product listing complete", { total, page, limit, totalPages, returned: products.length });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findCategoryByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async findCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  async createCategory(data: { name: string; slug: string }) {
    return prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: { name?: string; slug?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async countCategoryProducts(id: string) {
    return prisma.productCategory.count({
      where: { categoryId: id },
    });
  }
}

