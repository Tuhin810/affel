import crypto from "crypto";
import { TrackingRepository } from "../repositories/tracking.repository";
import { AffiliateLinkService } from "./affiliate-link.service";
import { RabbitMQService } from "../../../config/rabbitmq";
import prisma from "../../../database/prisma/client";
import logger from "../../../config/logger";

export class TrackingService {
  private trackingRepository = new TrackingRepository();
  private affiliateLinkService = new AffiliateLinkService();

  public async trackClick(params: {
    userId: string;
    entityType: string;
    entityId: string;
    productSourceId?: string; // Optional, mapping to ProductAffiliateLink.id
    merchantId?: string;
    campaignId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
  }): Promise<{ clickId: string; redirectUrl: string }> {
    const clickId = `clk_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;

    // 1. Perform Fraud checks
    if (params.ipAddress) {
      // Check for click spam: > 100 clicks in 1 minute
      const recentClicksCount = await this.trackingRepository.countClicksInTimeframe(params.ipAddress, 1);
      if (recentClicksCount >= 100) {
        logger.warn(`Spam activity detected from IP: ${params.ipAddress}. Flagging fraud.`);
        await this.trackingRepository.createFraudFlag({
          clickId,
          userId: params.userId,
          ipAddress: params.ipAddress,
          reason: "CLICK_SPAM",
          severity: "HIGH",
        });
      }
    }

    // 2. Resolve target URL and network ID from entity types
    let targetUrl = "";
    let networkId = "cuelinks"; // Default fallback network
    let finalProductSourceId = params.productSourceId || null;
    let finalMerchantId = params.merchantId || null;

    if (params.entityType.toUpperCase() === "PRODUCT") {
      // Find affiliate link for the product
      let linkRecord = null;
      if (params.productSourceId) {
        linkRecord = await prisma.productAffiliateLink.findUnique({
          where: { id: params.productSourceId },
        });
      } else {
        linkRecord = await prisma.productAffiliateLink.findFirst({
          where: { productId: params.entityId },
        });
      }

      if (linkRecord) {
        targetUrl = linkRecord.affiliateLink;
        networkId = linkRecord.platformName || "cuelinks";
        finalProductSourceId = linkRecord.id;
        
        // Load merchant details from product if possible to associate merchant ID
        const product = await prisma.product.findUnique({
          where: { id: params.entityId },
        });
        // Note: product model in schema currently does not have direct merchantId, 
        // but we keep finalMerchantId as passed.
      }
    } else if (params.entityType.toUpperCase() === "MERCHANT") {
      const merchant = await prisma.merchant.findUnique({
        where: { id: params.entityId },
      });
      if (merchant && merchant.affiliateUrl) {
        targetUrl = merchant.affiliateUrl;
        finalMerchantId = merchant.id;
        // In real settings, merchant.affiliateUrl might map to a network or we assume a config.
      }
    } else if (params.entityType.toUpperCase() === "BANNER") {
      const banner = await prisma.banner.findUnique({
        where: { id: params.entityId },
      });
      if (banner && banner.link) {
        targetUrl = banner.link;
      }
    }

    // Fallback target URL if nothing resolved
    if (!targetUrl) {
      targetUrl = "https://example.com/fallback";
    }

    // 3. Map SubIDs according to our SubID strategy
    const subids = {
      subid1: params.userId,
      subid2: params.entityType,
      subid3: params.entityId,
      subid4: params.campaignId || "none",
      subid5: clickId,
    };

    // 4. Generate redirect URL with wrapped sub-parameters
    const redirectUrl = this.affiliateLinkService.generateRedirectUrl(
      networkId,
      targetUrl,
      clickId,
      subids
    );

    // 5. Store Click Record
    const click = await this.trackingRepository.createClick({
      clickId,
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      productSourceId: finalProductSourceId,
      merchantId: finalMerchantId,
      campaignId: params.campaignId,
      affiliateNetworkId: networkId,
      subid1: subids.subid1,
      subid2: subids.subid2,
      subid3: subids.subid3,
      subid4: subids.subid4,
      subid5: subids.subid5,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceType: params.deviceType,
    });

    // 6. Publish event in RabbitMQ background processing
    await RabbitMQService.publish("click.created", {
      clickId,
      userId: click.userId,
      entityType: click.entityType,
      entityId: click.entityId,
      affiliateNetworkId: click.affiliateNetworkId,
      clickedAt: click.clickedAt,
    });

    return {
      clickId,
      redirectUrl,
    };
  }

  public async getClick(clickId: string) {
    return this.trackingRepository.findByClickId(clickId);
  }

  public async getUserHistory(userId: string) {
    return this.trackingRepository.findUserHistory(userId);
  }
}
