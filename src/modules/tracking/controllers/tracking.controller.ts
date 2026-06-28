import { Request, Response } from "express";
import { ZodError } from "zod";
import { TrackingService } from "../services/tracking.service";
import { trackClickSchema } from "../validators/tracking.validator";
import { ApiResponse } from "../../../common/utils/api-response";
import { AppError } from "../../../common/errors/app.error";

export class TrackingController {
  private trackingService = new TrackingService();

  public async trackClick(req: Request, res: Response): Promise<void> {
    const parsed = trackClickSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(this.formatValidationError(parsed.error), 400);
    }

    const {
      userId,
      entityType,
      entityId,
      campaignId,
      Device,
      Browser,
      IP,
      ReferralCode,
      redirect,
    } = parsed.data;

    // Resolve userId from authenticated user first, then fallback to request body
    const resolvedUserId = (req as any).user?.userId || userId;
    if (!resolvedUserId) {
      throw new AppError("User ID is required", 400);
    }

    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = IP || req.ip || (req.headers["x-forwarded-for"] as string) || "";

    // Resolve browser / device if not provided
    let browserName = Browser || "unknown";
    if (!Browser && userAgent) {
      if (/chrome/i.test(userAgent)) browserName = "Chrome";
      else if (/safari/i.test(userAgent)) browserName = "Safari";
      else if (/firefox/i.test(userAgent)) browserName = "Firefox";
      else if (/edge/i.test(userAgent)) browserName = "Edge";
    }

    let deviceType = Device || "DESKTOP";
    if (!Device && userAgent) {
      if (/mobile/i.test(userAgent)) deviceType = "MOBILE";
      else if (/tablet/i.test(userAgent)) deviceType = "TABLET";
    }

    const result = await this.trackingService.trackClick({
      userId: resolvedUserId,
      entityType,
      entityId,
      campaignId,
      device: deviceType,
      browser: browserName,
      ip: ipAddress,
      referralId: ReferralCode,
    });

    if (redirect === true || req.query.redirect === "true") {
      res.redirect(302, result.redirectUrl);
    } else {
      res.status(201).json(
        ApiResponse.success(result, "Click tracked successfully")
      );
    }
  }

  public async getClick(req: Request, res: Response): Promise<void> {
    const clickId = req.params.clickId as string;
    const click = await this.trackingService.getClick(clickId);
    if (!click) {
      throw new AppError("Click not found", 404);
    }
    res.status(200).json(ApiResponse.success(click, "Click details fetched successfully"));
  }

  public async getHistory(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const history = await this.trackingService.getUserHistory(userId);
    res.status(200).json(ApiResponse.success(history, "User history fetched successfully"));
  }

  private formatValidationError(error: ZodError): string {
    return error.issues.map((issue) => issue.message).join(", ");
  }
}

export const trackingController = new TrackingController();
export default trackingController;
