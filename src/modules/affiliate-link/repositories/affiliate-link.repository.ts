import prisma from "../../../database/prisma/client";

export class AffiliateLinkRepository {
  public async create(data: {
    entityType: string;
    entityId: string;
    merchantId?: string | null;
    originalUrl: string;
    affiliateUrl: string;
    cashbackPercent: number;
    commissionPercent?: number | null;
    priority?: number;
    isActive?: boolean;
    createdBy?: string | null;
  }) {
    return prisma.affiliateLink.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        merchantId: data.merchantId || null,
        originalUrl: data.originalUrl,
        affiliateUrl: data.affiliateUrl,
        cashbackPercent: data.cashbackPercent,
        commissionPercent: data.commissionPercent || null,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy || null,
      },
    });
  }

  public async findById(id: string) {
    return prisma.affiliateLink.findUnique({
      where: { id },
    });
  }

  public async findAll(filters?: { entityType?: string; isActive?: boolean }) {
    return prisma.affiliateLink.findMany({
      where: {
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: { priority: "desc" },
    });
  }

  public async update(id: string, data: Partial<{
    originalUrl: string;
    affiliateUrl: string;
    cashbackPercent: number;
    commissionPercent: number | null;
    priority: number;
    isActive: boolean;
  }>) {
    return prisma.affiliateLink.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string) {
    return prisma.affiliateLink.delete({
      where: { id },
    });
  }
}
