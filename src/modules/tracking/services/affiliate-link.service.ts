import { AffiliateNetworkAdapter } from "../adapters/network-adapter.interface";
import { CuelinksAdapter } from "../adapters/cuelinks.adapter";
import { AdmitadAdapter } from "../adapters/admitad.adapter";
import { ImpactAdapter } from "../adapters/impact.adapter";

export class AffiliateLinkService {
  private adapters: Record<string, AffiliateNetworkAdapter> = {
    cuelinks: new CuelinksAdapter(),
    admitad: new AdmitadAdapter(),
    impact: new ImpactAdapter(),
  };

  public getAdapter(networkId: string): AffiliateNetworkAdapter {
    const key = networkId.toLowerCase().trim();
    const adapter = this.adapters[key];
    if (!adapter) {
      // Fallback adapter to prevent failures
      return this.adapters.cuelinks;
    }
    return adapter;
  }

  public generateRedirectUrl(
    networkId: string,
    targetUrl: string,
    clickId: string,
    subids: {
      subid1: string; // user_id
      subid2: string; // entity_type
      subid3: string; // entity_id
      subid4: string; // campaign_id
      subid5: string; // click_id
    }
  ): string {
    const adapter = this.getAdapter(networkId);
    return adapter.generateTrackingUrl(targetUrl, clickId, subids);
  }
}
