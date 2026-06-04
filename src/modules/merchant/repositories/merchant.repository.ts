import prisma from "../../../database/prisma/client";

import { CreateMerchantDto } from "../dto/create-merchant.dto";

export class MerchantRepository {
  async create(
    data: CreateMerchantDto
  ) {
    return prisma.merchant.create({
      data: {
        ...data,
      },
    });
  }

  async findBySlug(
    slug: string
  ) {
    return prisma.merchant.findUnique({
      where: {
        slug,
      },
    });
  }

  async findById(
    id: string
  ) {
    return prisma.merchant.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return prisma.merchant.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(
    id: string,
    data: Partial<CreateMerchantDto>
  ) {
    return prisma.merchant.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    id: string
  ) {
    return prisma.merchant.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        isDeleted: true,
      },
    });
  }
}