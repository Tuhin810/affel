import prisma from "../../../database/prisma/client";

export class AnalyticsService {
  public async getOverviewReport() {
    const totalClicks = await prisma.click.count();
    const totalConversions = await prisma.conversion.count();
    
    const financialStats = await prisma.conversion.aggregate({
      _sum: {
        orderAmount: true,
        commissionAmount: true,
        cashbackAmount: true,
      },
    });

    return {
      totalClicks,
      totalConversions,
      totalOrderAmount: financialStats._sum.orderAmount || 0,
      totalCommission: financialStats._sum.commissionAmount || 0,
      totalCashback: financialStats._sum.cashbackAmount || 0,
    };
  }

  public async getEntityAnalytics(entityType: string) {
    const clicksGrouped = await prisma.click.groupBy({
      by: ["entityId"],
      where: {
        entityType: entityType.toUpperCase(),
      },
      _count: {
        clickId: true,
      },
      orderBy: {
        _count: {
          clickId: "desc",
        },
      },
      take: 10,
    });

    // For each top clicked entity, find how many converted
    const result = [];
    for (const group of clicksGrouped) {
      const conversionCount = await prisma.conversion.count({
        where: {
          click: {
            entityType: entityType.toUpperCase(),
            entityId: group.entityId,
          },
        },
      });

      result.push({
        entityId: group.entityId,
        clicks: group._count.clickId,
        conversions: conversionCount,
        conversionRate: group._count.clickId > 0 
          ? parseFloat(((conversionCount / group._count.clickId) * 100).toFixed(2)) 
          : 0,
      });
    }

    return result;
  }

  public async getCampaignAnalytics() {
    const clicksGrouped = await prisma.click.groupBy({
      by: ["campaignId"],
      where: {
        campaignId: {
          not: null,
        },
      },
      _count: {
        clickId: true,
      },
      orderBy: {
        _count: {
          clickId: "desc",
        },
      },
      take: 10,
    });

    const result = [];
    for (const group of clicksGrouped) {
      if (!group.campaignId) continue;
      const conversionCount = await prisma.conversion.count({
        where: {
          click: {
            campaignId: group.campaignId,
          },
        },
      });

      result.push({
        campaignId: group.campaignId,
        clicks: group._count.clickId,
        conversions: conversionCount,
        conversionRate: group._count.clickId > 0
          ? parseFloat(((conversionCount / group._count.clickId) * 100).toFixed(2))
          : 0,
      });
    }

    return result;
  }
}
export const analyticsService = new AnalyticsService();
