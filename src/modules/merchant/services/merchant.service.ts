import { AppError } from "../../../common/errors/app.error";

import { CreateMerchantDto } from "../dto/create-merchant.dto";

import { MerchantRepository } from "../repositories/merchant.repository";

export class MerchantService {
  constructor(
    private readonly merchantRepository: MerchantRepository
  ) {}

  async create(
    dto: CreateMerchantDto
  ) {
    const existingMerchant =
      await this.merchantRepository.findBySlug(
        dto.slug
      );

    if (existingMerchant) {
      throw new AppError(
        "Merchant slug already exists",
        409
      );
    }

    return this.merchantRepository.create(dto);
  }

  async getAll() {
    return this.merchantRepository.findAll();
  }

  async getById(
    id: string
  ) {
    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {
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

    const merchant =
      await this.merchantRepository.findBySlug(
        slug
      );

    if (!merchant) {

      throw new AppError(
        "Merchant not found",
        404
      );

    }
    return merchant;
  }
  async update(
    id: string,
    dto: Partial<CreateMerchantDto>
  ) {

    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {

      throw new AppError(
        "Merchant not found",
        404
      );

    }

    return this.merchantRepository.update(
      id,
      dto
    );
  }

  async delete(
    id: string
  ) {

    const merchant =
      await this.merchantRepository.findById(
        id
      );

    if (!merchant) {

      throw new AppError(
        "Merchant not found",
        404
      );

    }

    await this.merchantRepository.softDelete(
      id
    );
  }
}