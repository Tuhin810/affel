import { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";

export class AnalyticsController {
  public async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getOverviewReport();
      res.status(200).json({ success: true, data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }

  public async getEntityReport(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as string;
      if (!type) {
        res.status(400).json({ success: false, message: "Entity type is required" });
        return;
      }
      const data = await analyticsService.getEntityAnalytics(type);
      res.status(200).json({ success: true, data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }

  public async getCampaignReport(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getCampaignAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
export const analyticsController = new AnalyticsController();
