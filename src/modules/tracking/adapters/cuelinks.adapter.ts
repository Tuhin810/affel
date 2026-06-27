import { AffiliateNetworkAdapter, ParsedConversion } from "./network-adapter.interface";

export class CuelinksAdapter implements AffiliateNetworkAdapter {
  public generateTrackingUrl(
    targetUrl: string,
    clickId: string,
    subids: {
      subid1: string;
      subid2: string;
      subid3: string;
      subid4: string;
      subid5: string;
    }
  ): string {
    // For Cuelinks, we append subid1 through subid5 to the query string
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("subid", subids.subid5); // Cuelinks standard primary subid
      url.searchParams.set("subid1", subids.subid1);
      url.searchParams.set("subid2", subids.subid2);
      url.searchParams.set("subid3", subids.subid3);
      url.searchParams.set("subid4", subids.subid4);
      url.searchParams.set("subid5", subids.subid5);
      return url.toString();
    } catch {
      // Fallback if targetUrl is not a valid URL (e.g. template path)
      const separator = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${separator}subid=${subids.subid5}&subid1=${subids.subid1}&subid2=${subids.subid2}&subid3=${subids.subid3}&subid4=${subids.subid4}&subid5=${subids.subid5}`;
    }
  }

  public parseConversion(payload: any): ParsedConversion {
    // Cuelinks webhook parameters mapping
    const clickId = payload.subid5 || payload.subid || payload.click_id;
    const transactionId = payload.transaction_id || payload.tx_id || payload.id;
    const orderAmount = parseFloat(payload.order_amount || payload.amount || payload.sale_amount || "0");
    const commissionAmount = parseFloat(payload.commission || payload.payout || payload.earning || "0");
    
    // Status mapping
    let status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" = "PENDING";
    const rawStatus = String(payload.status || "").toUpperCase();
    if (rawStatus === "APPROVED" || rawStatus === "CONFIRMED" || rawStatus === "SUCCESS") {
      status = "APPROVED";
    } else if (rawStatus === "REJECTED" || rawStatus === "DECLINED") {
      status = "REJECTED";
    } else if (rawStatus === "CANCELLED" || rawStatus === "CANCELED") {
      status = "CANCELLED";
    }

    const conversionDate = payload.date || payload.conversion_time 
      ? new Date(payload.date || payload.conversion_time) 
      : new Date();

    if (!clickId || !transactionId) {
      throw new Error("Invalid Cuelinks conversion payload: clickId or transactionId is missing");
    }

    return {
      clickId,
      transactionId,
      orderAmount,
      commissionAmount,
      status,
      conversionDate,
    };
  }
}
