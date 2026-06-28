import { AppError } from "../../../common/errors/app.error";
import { CreateMerchantDto } from "../dto/create-merchant.dto";
import { UpdateMerchantDto } from "../dto/update-merchant.dto";
import { MerchantRepository } from "../repositories/merchant.repository";
import prisma from "../../../database/prisma/client";
import logger from "../../../config/logger";

export class MerchantService {
  constructor(private readonly merchantRepository: MerchantRepository) {}

  async create(dto: CreateMerchantDto) {
    logger.info("Creating merchant", { slug: dto.slug, name: dto.name });

    const existingMerchant = await this.merchantRepository.findBySlug(dto.slug);
    if (existingMerchant) {
      logger.warn("Merchant creation blocked because slug already exists", {
        slug: dto.slug,
        existingMerchantId: existingMerchant.id,
      });
      throw new AppError("Merchant slug already exists", 409);
    }

    // Security validation for logoUrl
    if (dto.logoUrl) {
      try {
        const parsedUrl = new URL(dto.logoUrl);
        if (parsedUrl.hostname !== "res.cloudinary.com") {
          throw new AppError("Invalid logoUrl: Must be a Cloudinary URL", 400);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Invalid logoUrl format", 400);
      }
    }

    if (dto.logoPublicId) {
      if (!dto.logoPublicId.startsWith("merchant/logos/")) {
        throw new AppError("Invalid logoPublicId: Must start with merchant/logos/", 400);
      }
    }

    const { affiliateUrl, ...merchantData } = dto;

    // Create merchant record
    const merchant = await this.merchantRepository.create(dto);

    // Create corresponding AffiliateLink record if affiliateUrl is provided
    if (affiliateUrl) {
      logger.info("Creating associated merchant affiliate link", { merchantId: merchant.id, affiliateUrl });
      await prisma.affiliateLink.create({
        data: {
          entityType: "MERCHANT",
          entityId: merchant.id,
          merchantId: merchant.id,
          originalUrl: merchant.websiteUrl || "https://www.boat-lifestyle.com",
          affiliateUrl,
          cashbackPercent: merchant.cashback || 0.0,
          priority: 1,
          isActive: true,
        },
      });
    }

    logger.info("Merchant created successfully", { id: merchant.id, slug: merchant.slug });

    return {
      ...merchant,
      affiliateUrl: affiliateUrl || null,
    };
  }

  async getAll() {
    logger.info("Fetching active merchants");

    const merchants = await this.merchantRepository.findAll();

    // Fetch and map affiliate links
    const enrichedMerchants = await Promise.all(
      merchants.map(async (merchant) => {
        const affiliateLink = await prisma.affiliateLink.findFirst({
          where: {
            entityType: "MERCHANT",
            entityId: merchant.id,
            isActive: true,
          },
        });
        return {
          ...merchant,
          affiliateUrl: affiliateLink?.affiliateUrl || null,
        };
      })
    );

    logger.info("Active merchants fetched with links", { count: enrichedMerchants.length });
    return enrichedMerchants;
  }

  async getById(id: string) {
    logger.info("Fetching merchant by id", { id });

    const merchant = await this.merchantRepository.findById(id);
    if (!merchant) {
      logger.warn("Merchant not found by id", { id });
      throw new AppError("Merchant not found", 404);
    }

    const affiliateLink = await prisma.affiliateLink.findFirst({
      where: {
        entityType: "MERCHANT",
        entityId: id,
        isActive: true,
      },
    });

    return {
      ...merchant,
      affiliateUrl: affiliateLink?.affiliateUrl || null,
    };
  }

  async getBySlug(slug: string) {
    logger.info("Fetching merchant by slug", { slug });

    const merchant = await this.merchantRepository.findBySlug(slug);
    if (!merchant) {
      logger.warn("Merchant not found by slug", { slug });
      throw new AppError("Merchant not found", 404);
    }

    const affiliateLink = await prisma.affiliateLink.findFirst({
      where: {
        entityType: "MERCHANT",
        entityId: merchant.id,
        isActive: true,
      },
    });

    return {
      ...merchant,
      affiliateUrl: affiliateLink?.affiliateUrl || null,
    };
  }

  async updateMerchant(id: string, dto: UpdateMerchantDto) {
    logger.info("Updating merchant", { id, fields: Object.keys(dto ?? {}) });

    const merchant = await this.merchantRepository.findById(id);
    if (!merchant) {
      logger.warn("Merchant update blocked because merchant was not found", { id });
      throw new AppError("Merchant not found", 404);
    }

    // Security validation for logoUrl
    if (dto.logoUrl) {
      try {
        const parsedUrl = new URL(dto.logoUrl);
        if (parsedUrl.hostname !== "res.cloudinary.com") {
          throw new AppError("Invalid logoUrl: Must be a Cloudinary URL", 400);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Invalid logoUrl format", 400);
      }
    }

    if (dto.logoPublicId) {
      if (!dto.logoPublicId.startsWith("merchant/logos/")) {
        throw new AppError("Invalid logoPublicId: Must start with merchant/logos/", 400);
      }
    }

    const { affiliateUrl, ...merchantData } = dto;

    // Update merchant record
    const updatedMerchant = await this.merchantRepository.update(id, merchantData);

    // Sync affiliateUrl in the AffiliateLink table
    let currentAffiliateUrl: string | null | undefined = affiliateUrl;
    if (affiliateUrl !== undefined) {
      const existingLink = await prisma.affiliateLink.findFirst({
        where: {
          entityType: "MERCHANT",
          entityId: id,
        },
      });

      if (existingLink) {
        if (affiliateUrl === null || affiliateUrl === "") {
          logger.info("Deleting merchant affiliate link", { merchantId: id });
          await prisma.affiliateLink.delete({ where: { id: existingLink.id } });
          currentAffiliateUrl = undefined;
        } else {
          logger.info("Updating merchant affiliate link", { merchantId: id, affiliateUrl });
          const updatedLink = await prisma.affiliateLink.update({
            where: { id: existingLink.id },
            data: {
              affiliateUrl,
              cashbackPercent: updatedMerchant.cashback || 0.0,
            },
          });
          currentAffiliateUrl = updatedLink.affiliateUrl;
        }
      } else if (affiliateUrl) {
        logger.info("Creating new merchant affiliate link on update", { merchantId: id, affiliateUrl });
        const newLink = await prisma.affiliateLink.create({
          data: {
            entityType: "MERCHANT",
            entityId: id,
            merchantId: id,
            originalUrl: updatedMerchant.websiteUrl || "https://www.boat-lifestyle.com",
            affiliateUrl,
            cashbackPercent: updatedMerchant.cashback || 0.0,
            priority: 1,
            isActive: true,
          },
        });
        currentAffiliateUrl = newLink.affiliateUrl;
      }
    } else {
      // Find existing link to return in output response
      const existingLink = await prisma.affiliateLink.findFirst({
        where: {
          entityType: "MERCHANT",
          entityId: id,
          isActive: true,
        },
      });
      currentAffiliateUrl = existingLink?.affiliateUrl || null;
    }

    logger.info("Merchant updated successfully", { id: updatedMerchant.id });

    return {
      ...updatedMerchant,
      affiliateUrl: currentAffiliateUrl || null,
    };
  }

  async delete(id: string) {
    logger.info("Deleting merchant", { id });

    const merchant = await this.merchantRepository.findById(id);
    if (!merchant) {
      logger.warn("Merchant delete blocked because merchant was not found", { id });
      throw new AppError("Merchant not found", 404);
    }

    // Delete associated affiliate links
    await prisma.affiliateLink.deleteMany({
      where: {
        entityType: "MERCHANT",
        entityId: id,
      },
    });

    await this.merchantRepository.softDelete(id);
    logger.info("Merchant soft deleted with links", { id });
  }
}
