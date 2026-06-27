import { Request, Response } from "express";
import { TrackingService } from "../services/tracking.service";

export class TrackingController {
  private trackingService = new TrackingService();

  public async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId || req.body.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
      }

      const { entityType, entityId, productSourceId, merchantId, campaignId, redirect } = req.body;

      if (!entityType || !entityId) {
        res.status(400).json({ success: false, message: "entityType and entityId are required" });
        return;
      }

      const ipAddress = req.ip || req.headers["x-forwarded-for"] as string || "";
      const userAgent = req.headers["user-agent"] || "";
      
      // Basic device type detection
      let deviceType = "DESKTOP";
      if (/mobile/i.test(userAgent)) deviceType = "MOBILE";
      else if (/tablet/i.test(userAgent)) deviceType = "TABLET";

      const result = await this.trackingService.trackClick({
        userId,
        entityType,
        entityId,
        productSourceId,
        merchantId,
        campaignId,
        ipAddress,
        userAgent,
        deviceType,
      });

      if (redirect === true || req.query.redirect === "true") {
        res.redirect(302, result.redirectUrl);
      } else {
        res.status(201).json({
          success: true,
          message: "Click tracked successfully",
          data: result,
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }

  public async getClick(req: Request, res: Response): Promise<void> {
    try {
      const clickId = req.params.clickId as string;
      const click = await this.trackingService.getClick(clickId);
      if (!click) {
        res.status(404).json({ success: false, message: "Click not found" });
        return;
      }
      res.status(200).json({ success: true, data: click });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }

  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const history = await this.trackingService.getUserHistory(userId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
export const trackingController = new TrackingController();
