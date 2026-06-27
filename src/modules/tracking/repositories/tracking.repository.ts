import prisma from "../../../database/prisma/client";

export class TrackingRepository {
  public async createClick(data: {
    clickId: string;
    userId: string;
    entityType: string;
    entityId: string;
    productSourceId?: string | null;
    merchantId?: string | null;
    campaignId?: string | null;
    affiliateNetworkId?: string | null;
    subid1?: string | null;
    subid2?: string | null;
    subid3?: string | null;
    subid4?: string | null;
    subid5?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    deviceType?: string | null;
  }) {
    return prisma.click.create({
      data,
    });
  }

  public async findByClickId(clickId: string) {
    return prisma.click.findUnique({
      where: { clickId },
    });
  }

  public async findUserHistory(userId: string) {
    return prisma.click.findMany({
      where: { userId },
      orderBy: { clickedAt: "desc" },
    });
  }

  public async createFraudFlag(data: {
    clickId?: string | null;
    userId?: string | null;
    ipAddress?: string | null;
    reason: string;
    severity: string;
  }) {
    return prisma.fraudFlag.create({
      data,
    });
  }

  public async countClicksInTimeframe(ip: string, minutes: number): Promise<number> {
    const timeframeDate = new Date(Date.now() - minutes * 60 * 1000);
    return prisma.click.count({
      where: {
        ipAddress: ip,
        clickedAt: {
          gte: timeframeDate,
        },
      },
    });
  }
}
