import prisma from "../../../database/prisma/client";
import { CreateMerchantDto } from "../dto/create-merchant.dto";
import { UpdateMerchantDto } from "../dto/update-merchant.dto";
import logger from "../../../config/logger";

export class MerchantRepository {
  async create(data: CreateMerchantDto) {
    logger.info("Creating merchant record in database", { slug: data.slug, name: data.name });

    const { affiliateUrl, ...merchantData } = data;

    const merchant = await prisma.merchant.create({
      data: merchantData,
    });

    logger.info("Merchant record created", { id: merchant.id, slug: merchant.slug });
    return merchant;
  }

  async findBySlug(slug: string) {
    logger.info("Finding merchant record by slug", { slug });

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
    });

    logger.info("Merchant record lookup by slug completed", { slug, found: Boolean(merchant) });
    return merchant;
  }

  async findById(id: string) {
    logger.info("Finding merchant record by id", { id });

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    logger.info("Merchant record lookup by id completed", { id, found: Boolean(merchant) });
    return merchant;
  }

  async findAll() {
    logger.info("Finding active merchant records");

    const merchants = await prisma.merchant.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    logger.info("Active merchant records found", { count: merchants.length });
    return merchants;
  }

  async update(id: string, data: UpdateMerchantDto) {
    logger.info("Updating merchant record in database", { id, fields: Object.keys(data ?? {}) });

    const { affiliateUrl, ...merchantData } = data;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: merchantData,
    });

    logger.info("Merchant record updated", { id: merchant.id, slug: merchant.slug });
    return merchant;
  }

  async softDelete(id: string) {
    logger.info("Soft deleting merchant record", { id });

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    logger.info("Merchant record soft deleted", { id: merchant.id, slug: merchant.slug });
    return merchant;
  }
}
