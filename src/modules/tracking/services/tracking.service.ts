import crypto from "crypto";
import { ClickRepository } from "../repositories/click.repository";
import { RabbitMQService } from "../../../config/rabbitmq";
import prisma from "../../../database/prisma/client";
import logger from "../../../config/logger";
import { AppError } from "../../../common/errors/app.error";

export class TrackingService {
  private clickRepository = new ClickRepository();

  public async trackClick(params: {
    userId: string;
    entityType: string;
    entityId: string;
    campaignId?: string;
    referralId?: string;
    device?: string;
    browser?: string;
    ip?: string;
  }): Promise<{ clickId: string; redirectUrl: string }> {
    const clickId = `clk_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
    const entityType = params.entityType.toUpperCase();
    const entityId = params.entityId;

    // 1. FIND AFFILIATE LINK (SINGLE SOURCE OF TRUTH)
    const affiliateLink = await prisma.affiliateLink.findFirst({
      where: {
        entityType,
        entityId,
        isActive: true,
      },
      orderBy: {
        priority: "desc",
      },
    });

    if (!affiliateLink) {
      logger.warn(`No active affiliate link configured for entityType: ${entityType}, entityId: ${entityId}`);
      throw new AppError("Affiliate link not found or inactive for this entity", 404);
    }

    let isFraud = false;
    let fraudReason = "";
    let fraudSeverity = "LOW";

    // 2. FRAUD DETECTION FLOW
    // Check Rapid Clicks (IP)
    if (params.ip) {
      const ipClickCount = await this.clickRepository.countClicksInTimeframe(params.ip, 10);
      if (ipClickCount >= 5) {
        isFraud = true;
        fraudReason = "RAPID_CLICKS_IP";
        fraudSeverity = "MEDIUM";
      }
    }

    // Check Rapid Clicks (User)
    if (!isFraud && params.userId) {
      const userClickCount = await this.clickRepository.countUserClicksInTimeframe(params.userId, 10);
      if (userClickCount >= 5) {
        isFraud = true;
        fraudReason = "RAPID_CLICKS_USER";
        fraudSeverity = "MEDIUM";
      }
    }

    // Check Duplicate Click
    if (!isFraud && params.userId && params.ip && params.device) {
      const duplicateClick = await this.clickRepository.findDuplicateClick(
        params.userId,
        entityId,
        params.ip,
        params.device,
        30
      );
      if (duplicateClick) {
        isFraud = true;
        fraudReason = "DUPLICATE_CLICK";
        fraudSeverity = "LOW";
      }
    }

    // Check Self Referral
    if (!isFraud && entityType === "REFERRAL" && entityId === params.userId) {
      isFraud = true;
      fraudReason = "SELF_REFERRAL";
      fraudSeverity = "HIGH";
    }

    // Check VPN / Proxy Abuse
    if (!isFraud && params.ip) {
      const isLocalHost = params.ip === "127.0.0.1" || params.ip === "::1" || params.ip.startsWith("192.168.");
      if (!isLocalHost && (params.ip.startsWith("10.") || params.ip.startsWith("172.16."))) {
        isFraud = true;
        fraudReason = "VPN_PROXY_ABUSE";
        fraudSeverity = "MEDIUM";
      }
    }

    // 3. GENERATE REDIRECT URL
    let redirectUrl = affiliateLink.affiliateUrl;
    if (redirectUrl.includes("{clickId}")) {
      redirectUrl = redirectUrl.replace("{clickId}", clickId);
    } else if (redirectUrl.includes("{click_id}")) {
      redirectUrl = redirectUrl.replace("{click_id}", clickId);
    }

    // 4. RESOLVE MERCHANT AND PRODUCT SOURCE DETAILS
    let finalMerchantId = affiliateLink.merchantId || null;
    let finalProductSourceId = entityType === "PRODUCT_SOURCE" ? entityId : null;

    if (!finalMerchantId && entityType === "PRODUCT_SOURCE") {
      const productSource = await prisma.productSource.findUnique({
        where: { id: entityId },
      });
      if (productSource) {
        finalMerchantId = productSource.merchantId;
      }
    }

    // 5. SAVE CLICK RECORD
    const status = isFraud ? "FRAUD" : "ACTIVE";
    const click = await this.clickRepository.createClick({
      clickId,
      userId: params.userId,
      entityType,
      entityId,
      merchantId: finalMerchantId,
      productSourceId: finalProductSourceId,
      affiliateLinkId: affiliateLink.id,
      campaignId: params.campaignId || null,
      referralId: params.referralId || null,
      device: params.device || null,
      browser: params.browser || null,
      ip: params.ip || null,
      status,
    });

    // 6. RECORD FRAUD FLAG IF DETECTED
    if (isFraud) {
      await this.clickRepository.createFraudFlag({
        clickId,
        userId: params.userId,
        ipAddress: params.ip,
        reason: fraudReason,
        severity: fraudSeverity,
      });
      logger.warn(`Fraud click flagged: ${clickId} reason: ${fraudReason} severity: ${fraudSeverity}`);
    }

    // 7. LOG CLICK ANALYTICS
    await this.clickRepository.logClickAnalytics({
      entityType,
      entityId,
      merchantId: finalMerchantId,
      productSourceId: finalProductSourceId,
      device: params.device,
      browser: params.browser,
      ip: params.ip,
      referrer: params.referralId,
    });

    // 8. PUBLISH EVENTS TO RABBITMQ
    await RabbitMQService.publish("click.created", {
      clickId,
      userId: params.userId,
      entityType,
      entityId,
      status,
      createdAt: click.createdAt,
    });

    await RabbitMQService.publish("analytics.update", {
      clickId,
      entityType,
      entityId,
      merchantId: finalMerchantId,
      productSourceId: finalProductSourceId,
      device: params.device,
      status,
    });

    return {
      clickId,
      redirectUrl,
    };
  }

  public async getClick(clickId: string) {
    return this.clickRepository.findByClickId(clickId);
  }

  public async getUserHistory(userId: string) {
    return this.clickRepository.findUserHistory(userId);
  }
}

export const trackingService = new TrackingService();
export default trackingService;
