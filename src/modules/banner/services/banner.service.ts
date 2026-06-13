import { AppError } from "../../../common/errors/app.error";
import { CreateBannerDto } from "../dto/create-banner.dto";
import { UpdateBannerDto } from "../dto/update-banner.dto";
import { BannerRepository } from "../repositories/banner.repository";
import logger from "../../../config/logger";

export class BannerService {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async create(dto: CreateBannerDto) {
    logger.info("Creating banner service call", { title: dto.title, placement: dto.placement });

    // Validate imageUrl format & domain
    this.validateImageUrl(dto.imageUrl);

    // Validate imagePublicId folder prefix
    if (dto.imagePublicId) {
      this.validateImagePublicId(dto.imagePublicId);
    }

    const banner = await this.bannerRepository.create(dto);
    logger.info("Banner created successfully", { id: banner.id });
    return banner;
  }

  async getAllActive(placement?: string) {
    logger.info("Fetching active banners service call", { placement });
    return this.bannerRepository.findAllActive(placement);
  }

  async getAllAdmin() {
    logger.info("Fetching all banners for admin service call");
    return this.bannerRepository.findAllAdmin();
  }

  async getById(id: string) {
    logger.info("Fetching banner by id service call", { id });
    const banner = await this.bannerRepository.findById(id);

    if (!banner || banner.isDeleted) {
      logger.warn("Banner not found or deleted", { id });
      throw new AppError("Banner not found", 404);
    }

    return banner;
  }

  async getActiveById(id: string) {
    logger.info("Fetching active banner by id service call", { id });
    const banner = await this.bannerRepository.findActiveById(id);

    if (!banner) {
      logger.warn("Active banner not found", { id });
      throw new AppError("Banner not found", 404);
    }

    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    logger.info("Updating banner service call", { id, fields: Object.keys(dto) });

    const existing = await this.bannerRepository.findById(id);
    if (!existing || existing.isDeleted) {
      logger.warn("Banner to update not found or deleted", { id });
      throw new AppError("Banner not found", 404);
    }

    if (dto.imageUrl) {
      this.validateImageUrl(dto.imageUrl);
    }

    if (dto.imagePublicId) {
      this.validateImagePublicId(dto.imagePublicId);
    }

    const updated = await this.bannerRepository.update(id, dto);
    logger.info("Banner updated successfully", { id: updated.id });
    return updated;
  }

  async delete(id: string) {
    logger.info("Deleting banner service call", { id });

    const existing = await this.bannerRepository.findById(id);
    if (!existing || existing.isDeleted) {
      logger.warn("Banner to delete not found or deleted", { id });
      throw new AppError("Banner not found", 404);
    }

    await this.bannerRepository.softDelete(id);
    logger.info("Banner soft deleted successfully", { id });
  }

  private validateImageUrl(urlStr: string): void {
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.hostname !== "res.cloudinary.com") {
        throw new AppError("Invalid imageUrl: Must be a Cloudinary URL", 400);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid imageUrl format", 400);
    }
  }

  private validateImagePublicId(publicId: string): void {
    if (!publicId.startsWith("banners/")) {
      throw new AppError("Invalid imagePublicId: Must start with banners/", 400);
    }
  }
}
