import prisma from "../../../database/prisma/client";

export class ClickRepository {
  public async createClick(data: {
    clickId: string;
    userId: string;
    entityType: string;
    entityId: string;
    merchantId?: string | null;
    productSourceId?: string | null;
    affiliateLinkId?: string | null;
    campaignId?: string | null;
    referralId?: string | null;
    device?: string | null;
    browser?: string | null;
    ip?: string | null;
    status?: string;
  }) {
    return prisma.click.create({
      data,
    });
  }

  public async findByClickId(clickId: string) {
    return prisma.click.findUnique({
      where: { clickId },
      include: { affiliateLink: true },
    });
  }

  public async findUserHistory(userId: string) {
    return prisma.click.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  public async countClicksInTimeframe(ip: string, seconds: number): Promise<number> {
    const timeframeDate = new Date(Date.now() - seconds * 1000);
    return prisma.click.count({
      where: {
        ip,
        createdAt: {
          gte: timeframeDate,
        },
      },
    });
  }

  public async countUserClicksInTimeframe(userId: string, seconds: number): Promise<number> {
    const timeframeDate = new Date(Date.now() - seconds * 1000);
    return prisma.click.count({
      where: {
        userId,
        createdAt: {
          gte: timeframeDate,
        },
      },
    });
  }

  public async findDuplicateClick(
    userId: string,
    entityId: string,
    ip: string,
    device: string,
    seconds: number
  ) {
    const timeframeDate = new Date(Date.now() - seconds * 1000);
    return prisma.click.findFirst({
      where: {
        userId,
        entityId,
        ip,
        device,
        createdAt: {
          gte: timeframeDate,
        },
      },
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

  public async logClickAnalytics(data: {
    entityType: string;
    entityId: string;
    merchantId?: string | null;
    productSourceId?: string | null;
    device?: string | null;
    browser?: string | null;
    ip?: string | null;
    country?: string | null;
    referrer?: string | null;
  }) {
    return prisma.clickAnalytics.create({
      data,
    });
  }
}
export default ClickRepository;
