import { Request, Response } from "express";
import { walletService } from "../services/wallet.service";

export class WalletController {
  public async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const wallet = await walletService.getWallet(userId);
      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }

  public async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const transactions = await walletService.getTransactions(userId);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
export const walletController = new WalletController();
