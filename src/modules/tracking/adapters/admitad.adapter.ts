import { AffiliateNetworkAdapter, ParsedConversion } from "./network-adapter.interface";

export class AdmitadAdapter implements AffiliateNetworkAdapter {
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
    // Admitad supports subid, subid1, subid2, subid3, subid4
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("subid", subids.subid5); // Primary click identifier
      url.searchParams.set("subid1", subids.subid1);
      url.searchParams.set("subid2", subids.subid2);
      url.searchParams.set("subid3", subids.subid3);
      url.searchParams.set("subid4", subids.subid4);
      return url.toString();
    } catch {
      const separator = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${separator}subid=${subids.subid5}&subid1=${subids.subid1}&subid2=${subids.subid2}&subid3=${subids.subid3}&subid4=${subids.subid4}`;
    }
  }

  public parseConversion(payload: any): ParsedConversion {
    // Admitad webhook parameters mapping
    const clickId = payload.subid || payload.subid4 || payload.click_id;
    const transactionId = payload.admitad_id || payload.transaction_id || payload.id;
    const orderAmount = parseFloat(payload.payment || payload.order_amount || payload.amount || "0");
    const commissionAmount = parseFloat(payload.commission || payload.earnings || "0");
    
    let status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" = "PENDING";
    const rawStatus = String(payload.status || "").toUpperCase();
    if (rawStatus === "APPROVED" || rawStatus === "CONFIRMED" || rawStatus === "SUCCESS" || rawStatus === "1") {
      status = "APPROVED";
    } else if (rawStatus === "REJECTED" || rawStatus === "DECLINED" || rawStatus === "2") {
      status = "REJECTED";
    } else if (rawStatus === "CANCELLED" || rawStatus === "CANCELED") {
      status = "CANCELLED";
    }

    const conversionDate = payload.conversion_date || payload.conversion_time 
      ? new Date(payload.conversion_date || payload.conversion_time) 
      : new Date();

    if (!clickId || !transactionId) {
      throw new Error("Invalid Admitad conversion payload: clickId or transactionId is missing");
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
