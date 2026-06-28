import prisma from "../../../database/prisma/client";

export class ProductTrackingRepository {
  public async findProductSourceById(id: string) {
    return prisma.productSource.findUnique({
      where: { id },
      include: {
        product: true,
        merchant: true,
      },
    });
  }

  public async findProductSourcesByProduct(productId: string) {
    return prisma.productSource.findMany({
      where: { productId },
      include: { merchant: true },
    });
  }

  public async createProductSource(data: {
    productId: string;
    merchantId: string;
    originalProductUrl: string;
    affiliateUrl: string;
    campaignId?: string | null;
    cashback: number;
    commission: number;
    cookieDuration: number;
    trackingStatus: string;
  }) {
    return prisma.productSource.create({
      data,
    });
  }
}
