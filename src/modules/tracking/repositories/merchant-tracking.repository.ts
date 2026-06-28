import prisma from "../../../database/prisma/client";

export class MerchantTrackingRepository {
  public async findById(id: string) {
    return prisma.merchant.findUnique({
      where: { id },
    });
  }

  public async findBySlug(slug: string) {
    return prisma.merchant.findUnique({
      where: { slug },
    });
  }

  public async getTrackingSettings(id: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      select: { trackingSettings: true },
    });
    return merchant?.trackingSettings;
  }
}
