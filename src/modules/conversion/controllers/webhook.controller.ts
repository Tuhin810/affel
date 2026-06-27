import { Request, Response } from "express";
import { conversionService } from "../services/conversion.service";
import { AffiliateLinkService } from "../../tracking/services/affiliate-link.service";

export class WebhookController {
  private affiliateLinkService = new AffiliateLinkService();

  public async cuelinks(req: Request, res: Response): Promise<void> {
    try {
      const payload = { ...req.query, ...req.body };
      const adapter = this.affiliateLinkService.getAdapter("cuelinks");
      const parsed = adapter.parseConversion(payload);
      
      await conversionService.processConversion(parsed, "cuelinks");
      
      res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal webhook error";
      res.status(400).json({ success: false, message: msg });
    }
  }

  public async admitad(req: Request, res: Response): Promise<void> {
    try {
      const payload = { ...req.query, ...req.body };
      const adapter = this.affiliateLinkService.getAdapter("admitad");
      const parsed = adapter.parseConversion(payload);
      
      await conversionService.processConversion(parsed, "admitad");
      
      res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal webhook error";
      res.status(400).json({ success: false, message: msg });
    }
  }

  public async impact(req: Request, res: Response): Promise<void> {
    try {
      const payload = { ...req.query, ...req.body };
      const adapter = this.affiliateLinkService.getAdapter("impact");
      const parsed = adapter.parseConversion(payload);
      
      await conversionService.processConversion(parsed, "impact");
      
      res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal webhook error";
      res.status(400).json({ success: false, message: msg });
    }
  }
}
export const webhookController = new WebhookController();
