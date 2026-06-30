import { Prisma } from "@prisma/client";
import prisma from "../../../database/prisma/client";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ListProductsInput } from "../validators/list-products.validator";
import logger from "../../../config/logger";

export class ProductRepository {
  // Helper to fetch affiliate links for multiple products
  private async getAffiliateLinksForProducts(products: any[]) {
    if (products.length === 0) return {};
    const productIds = products.map((p) => p.id);
    
    const sources = await prisma.productSource.findMany({
      where: { productId: { in: productIds } },
      include: { merchant: true },
    });

    const sourceIds = sources.map((s) => s.id);

    const affiliateLinks = await prisma.affiliateLink.findMany({
      where: {
        entityType: "PRODUCT_SOURCE",
        entityId: { in: sourceIds },
      },
    });

    const linksMap: Record<string, any[]> = {};
    for (const source of sources) {
      const affLink = affiliateLinks.find((al) => al.entityId === source.id);
      if (!linksMap[source.productId]) {
        linksMap[source.productId] = [];
      }
      linksMap[source.productId].push({
        platformName: source.merchant.name,
        affiliateLink: affLink ? affLink.affiliateUrl : source.originalProductUrl,
        mrp: affLink && affLink.commissionPercent !== null ? affLink.commissionPercent : source.currentPrice,
        sellPrice: source.currentPrice,
        cashbackPercentage: affLink ? affLink.cashbackPercent : 0,
      });
    }

    return linksMap;
  }

  // Helper to fetch affiliate links for a single product
  private async getAffiliateLinksForProduct(productId: string) {
    const sources = await prisma.productSource.findMany({
      where: { productId },
      include: { merchant: true },
    });

    const sourceIds = sources.map((s) => s.id);

    const affiliateLinks = await prisma.affiliateLink.findMany({
      where: {
        entityType: "PRODUCT_SOURCE",
        entityId: { in: sourceIds },
      },
    });

    return sources.map((source) => {
      const affLink = affiliateLinks.find((al) => al.entityId === source.id);
      return {
        platformName: source.merchant.name,
        affiliateLink: affLink ? affLink.affiliateUrl : source.originalProductUrl,
        mrp: affLink && affLink.commissionPercent !== null ? affLink.commissionPercent : source.currentPrice,
        sellPrice: source.currentPrice,
        cashbackPercentage: affLink ? affLink.cashbackPercent : 0,
      };
    });
  }

  async create(data: CreateProductDto) {
    logger.info("Creating product in database", { name: data.name });

    const { categoryIds, affiliateLinks, ...productData } = data;

    // Resolve merchant names to IDs in a single batch query BEFORE starting transaction
    const merchantNames = affiliateLinks ? affiliateLinks.map((l) => l.platformName) : [];
    const merchants = merchantNames.length > 0 
      ? await prisma.merchant.findMany({ where: { name: { in: merchantNames } } })
      : [];
    const merchantMap = new Map(merchants.map((m) => [m.name, m.id]));

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

      if (affiliateLinks && affiliateLinks.length > 0) {
        for (const link of affiliateLinks) {
          const merchantId = merchantMap.get(link.platformName);
          if (merchantId) {
            const productSource = await tx.productSource.create({
              data: {
                productId: created.id,
                merchantId,
                originalProductUrl: link.affiliateLink,
                currentPrice: link.sellPrice,
                stock: 10,
                status: "ACTIVE",
              },
            });

            await tx.affiliateLink.create({
              data: {
                entityType: "PRODUCT_SOURCE",
                entityId: productSource.id,
                merchantId,
                originalUrl: link.affiliateLink,
                affiliateUrl: link.affiliateLink,
                cashbackPercent: link.cashbackPercentage,
                commissionPercent: link.mrp,
                isActive: true,
              },
            });
          }
        }
      }

      return created;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    logger.info("Product created in database with categories", { id: product.id });
    const populatedLinks = await this.getAffiliateLinksForProduct(product.id);
    return { ...product, affiliateLinks: populatedLinks };
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
    if (!product) return null;
    const affiliateLinks = await this.getAffiliateLinksForProduct(product.id);
    return { ...product, affiliateLinks };
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
    if (!product) return null;
    const affiliateLinks = await this.getAffiliateLinksForProduct(product.id);
    return { ...product, affiliateLinks };
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
    const linksMap = await this.getAffiliateLinksForProducts(products);
    return products.map((p) => ({
      ...p,
      affiliateLinks: linksMap[p.id] || [],
    }));
  }

  async findAllAdmin(search?: string) {
    logger.info("Finding all products for admin", { search });

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    const products = await prisma.product.findMany({
      where,
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

    logger.info("Admin products fetched", { count: products.length });
    const linksMap = await this.getAffiliateLinksForProducts(products);
    return products.map((p) => ({
      ...p,
      affiliateLinks: linksMap[p.id] || [],
    }));
  }

  async findAdminProductsPaginated(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    };

    logger.info("Finding paginated products for admin in repository", { page, limit, search });

    const [total, products, globalTotal, activeTotal, featuredTotal] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false, isActive: true } }),
      prisma.product.count({ where: { isDeleted: false, isFeatured: true } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const linksMap = await this.getAffiliateLinksForProducts(products);
    const productsWithLinks = products.map((p) => ({
      ...p,
      affiliateLinks: linksMap[p.id] || [],
    }));

    return {
      products: productsWithLinks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        globalTotalProducts: globalTotal,
        activeProductsCount: activeTotal,
        featuredProductsCount: featuredTotal,
      },
    };
  }

  async update(id: string, data: UpdateProductDto) {
    logger.info("Updating product in database", { id });

    const { categoryIds, affiliateLinks, ...productData } = data;

    // Resolve merchant names to IDs in a single batch query BEFORE starting transaction
    const merchantNames = affiliateLinks ? affiliateLinks.map((l) => l.platformName) : [];
    const merchants = merchantNames.length > 0 
      ? await prisma.merchant.findMany({ where: { name: { in: merchantNames } } })
      : [];
    const merchantMap = new Map(merchants.map((m) => [m.name, m.id]));

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

      if (affiliateLinks !== undefined) {
        const existingSources = await tx.productSource.findMany({
          where: { productId: id },
        });
        const sourceIds = existingSources.map((s) => s.id);
        
        await tx.affiliateLink.deleteMany({
          where: {
            entityType: "PRODUCT_SOURCE",
            entityId: { in: sourceIds },
          },
        });

        await tx.productSource.deleteMany({
          where: { productId: id },
        });

        for (const link of affiliateLinks) {
          const merchantId = merchantMap.get(link.platformName);
          if (merchantId) {
            const productSource = await tx.productSource.create({
              data: {
                productId: id,
                merchantId,
                originalProductUrl: link.affiliateLink,
                currentPrice: link.sellPrice,
                stock: 10,
                status: "ACTIVE",
              },
            });

            await tx.affiliateLink.create({
              data: {
                entityType: "PRODUCT_SOURCE",
                entityId: productSource.id,
                merchantId,
                originalUrl: link.affiliateLink,
                affiliateUrl: link.affiliateLink,
                cashbackPercent: link.cashbackPercentage,
                commissionPercent: link.mrp,
                isActive: true,
              },
            });
          }
        }
      }

      return updated;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    logger.info("Product updated successfully", { id: product.id });
    const populatedLinks = await this.getAffiliateLinksForProduct(product.id);
    return { ...product, affiliateLinks: populatedLinks };
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

  async findAllCategories(search?: string) {
    logger.info("Finding all categories in repository", { search });

    const where: Prisma.CategoryWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.category.findMany({
      where,
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

  async findCategoriesPaginated(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    logger.info("Finding paginated categories in repository", { page, limit, search });

    const [total, categories, globalTotal, linkedCount, totalProductLinks] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.category.count(),
      prisma.category.count({
        where: {
          products: {
            some: {},
          },
        },
      }),
      prisma.productCategory.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        globalTotalCategories: globalTotal,
        linkedCategoriesCount: linkedCount,
        totalProductLinks,
      },
    };
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
    const linksMap = await this.getAffiliateLinksForProducts(products);
    const productsWithLinks = products.map((p) => ({
      ...p,
      affiliateLinks: linksMap[p.id] || [],
    }));

    return {
      products: productsWithLinks,
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

