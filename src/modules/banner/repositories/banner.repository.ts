import prisma from "../../../database/prisma/client";
import { CreateBannerDto } from "../dto/create-banner.dto";
import { UpdateBannerDto } from "../dto/update-banner.dto";
import logger from "../../../config/logger";

export class BannerRepository {
  async create(data: CreateBannerDto) {
    logger.info("Creating banner record", {
      title: data.title,
      placement: data.placement,
    });

    const banner = await prisma.banner.create({
      data: {
        ...data,
        placement: data.placement || "HERO",
      },
    });

    logger.info("Banner record created", { id: banner.id });
    return banner;
  }

  async findById(id: string) {
    logger.info("Finding banner record by id", { id });

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    logger.info("Banner record lookup by id completed", {
      id,
      found: Boolean(banner),
    });

    return banner;
  }

  async findActiveById(id: string) {
    logger.info("Finding active banner record by id", { id });

    const banner = await prisma.banner.findFirst({
      where: {
        id,
        isActive: true,
        isDeleted: false,
      },
    });

    logger.info("Active banner record lookup by id completed", {
      id,
      found: Boolean(banner),
    });

    return banner;
  }

  async findAllActive(placement?: string) {
    logger.info("Finding active banner records", { placement });

    const banner = await prisma.banner.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(placement ? { placement } : {}),
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    logger.info("Active banner records found", { count: banner.length });
    return banner;
  }

  async findAllAdmin() {
    logger.info("Finding all non-deleted banner records for admin");

    const banners = await prisma.banner.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: [
        { placement: "asc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    logger.info("All non-deleted banner records found for admin", {
      count: banners.length,
    });

    return banners;
  }

  async update(id: string, data: UpdateBannerDto) {
    logger.info("Updating banner record", {
      id,
      fields: Object.keys(data ?? {}),
    });

    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    logger.info("Banner record updated", { id: banner.id });
    return banner;
  }

  async softDelete(id: string) {
    logger.info("Soft deleting banner record", { id });

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });

    logger.info("Banner record soft deleted", { id: banner.id });
    return banner;
  }
}
