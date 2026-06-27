import { AffiliateNetworkAdapter, ParsedConversion } from "./network-adapter.interface";

export class ImpactAdapter implements AffiliateNetworkAdapter {
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
    // Impact standard query parameters for sub-tracking: subid1, subid2, subid3, subid4, subid5
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("subid1", subids.subid1);
      url.searchParams.set("subid2", subids.subid2);
      url.searchParams.set("subid3", subids.subid3);
      url.searchParams.set("subid4", subids.subid4);
      url.searchParams.set("subid5", subids.subid5);
      return url.toString();
    } catch {
      const separator = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${separator}subid1=${subids.subid1}&subid2=${subids.subid2}&subid3=${subids.subid3}&subid4=${subids.subid4}&subid5=${subids.subid5}`;
    }
  }

  public parseConversion(payload: any): ParsedConversion {
    // Impact webhook mapping (often received via query/post parameters)
    const clickId = payload.subid5 || payload.subId5 || payload.click_id;
    const transactionId = payload.transaction_id || payload.oid || payload.id;
    const orderAmount = parseFloat(payload.amount || payload.order_amount || "0");
    const commissionAmount = parseFloat(payload.payout || payload.commission || "0");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" = "PENDING";
    const rawStatus = String(payload.status || "").toUpperCase();
    if (rawStatus === "APPROVED" || rawStatus === "CONFIRMED" || rawStatus === "APPROVED_ACTIVE") {
      status = "APPROVED";
    } else if (rawStatus === "REJECTED" || rawStatus === "REVERSED") {
      status = "REJECTED";
    } else if (rawStatus === "CANCELLED") {
      status = "CANCELLED";
    }

    const conversionDate = payload.conversion_date || payload.conversion_time
      ? new Date(payload.conversion_date || payload.conversion_time)
      : new Date();

    if (!clickId || !transactionId) {
      throw new Error("Invalid Impact conversion payload: clickId or transactionId is missing");
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
