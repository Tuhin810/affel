export interface ParsedConversion {
  clickId: string;
  transactionId: string;
  orderAmount: number;
  commissionAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  conversionDate: Date;
}

export interface AffiliateNetworkAdapter {
  generateTrackingUrl(
    targetUrl: string,
    clickId: string,
    subids: {
      subid1: string; // user_id
      subid2: string; // entity_type
      subid3: string; // entity_id
      subid4: string; // campaign_id
      subid5: string; // click_id
    }
  ): string;

  parseConversion(payload: any): ParsedConversion;
}
