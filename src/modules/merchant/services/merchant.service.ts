import { AppError } from "../../../common/errors/app.error";

import { CreateMerchantDto } from "../dto/create-merchant.dto";
import { UpdateMerchantDto } from "../dto/update-merchant.dto";

import { MerchantRepository } from "../repositories/merchant.repository";
import logger from "../../../config/logger";

export class MerchantService {
  constructor(
    private readonly merchantRepository: MerchantRepository
  ) {}

  async create(
    dto: CreateMerchantDto
  ) {
    logger.info(
      "Creating merchant",
      {
        slug: dto.slug,
        name: dto.name,
      }
    );

    const existingMerchant =
      await this.merchantRepository.findBySlug(
        dto.slug
      );

    if (existingMerchant) {
      logger.warn(
        "Merchant creation blocked because slug already exists",
        {
          slug: dto.slug,
          existingMerchantId: existingMerchant.id,
        }
      );

      throw new AppError(
        "Merchant slug already exists",
        409
      );
    }

    // Security validation
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

    const merchant =
      await this.merchantRepository.create(dto);

    logger.info(
      "Merchant created",
      {
        id: merchant.id,
        slug: merchant.slug,
      }
    );

    return merchant;
  }

  async getAll() {
    logger.info(
      "Fetching active merchants"
    );

    const merchants =
      await this.merchantRepository.findAll();

    logger.info(
      "Active merchants fetched",
      {
        count: merchants.length,
      }
    );

    return merchants;
  }

  async getById(
    id: string
  ) {
    logger.info(
      "Fetching merchant by id",
      {
        id,
      }
    );

    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {
      logger.warn(
        "Merchant not found by id",
        {
          id,
        }
      );

      throw new AppError(
        "Merchant not found",
        404
      );
    }

    return merchant;
  }

  async getBySlug(
    slug: string
  ) {
    logger.info(
      "Fetching merchant by slug",
      {
        slug,
      }
    );

    const merchant =
      await this.merchantRepository.findBySlug(
        slug
      );

    if (!merchant) {
      logger.warn(
        "Merchant not found by slug",
        {
          slug,
        }
      );

      throw new AppError(
        "Merchant not found",
        404
      );

    }
    return merchant;
  }
  async updateMerchant(
    id: string,
    dto: UpdateMerchantDto
  ) {
    logger.info(
      "Updating merchant",
      {
        id,
        fields: Object.keys(dto ?? {}),
      }
    );

    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {
      logger.warn(
        "Merchant update blocked because merchant was not found",
        {
          id,
        }
      );

      throw new AppError(
        "Merchant not found",
        404
      );
    }

    // Security validation
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

    const updatedMerchant =
      await this.merchantRepository.update(
      id,
      dto
    );

    logger.info(
      "Merchant updated",
      {
        id: updatedMerchant.id,
        slug: updatedMerchant.slug,
      }
    );

    return updatedMerchant;
  }

  async delete(
    id: string
  ) {
    logger.info(
      "Deleting merchant",
      {
        id,
      }
    );

    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {
      logger.warn(
        "Merchant delete blocked because merchant was not found",
        {
          id,
        }
      );

      throw new AppError(
        "Merchant not found",
        404
      );

    }

    await this.merchantRepository.softDelete(
      id
    );

    logger.info(
      "Merchant soft deleted",
      {
        id,
      }
    );
  }
}
