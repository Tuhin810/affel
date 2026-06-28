import { AffiliateLinkRepository } from "../repositories/affiliate-link.repository";

export class AffiliateLinkService {
  private repository = new AffiliateLinkRepository();

  public async createLink(data: {
    entityType: string;
    entityId: string;
    merchantId?: string | null;
    originalUrl: string;
    affiliateUrl: string;
    cashbackPercent: number;
    commissionPercent?: number | null;
    priority?: number;
    isActive?: boolean;
    createdBy?: string | null;
  }) {
    return this.repository.create(data);
  }

  public async getLink(id: string) {
    return this.repository.findById(id);
  }

  public async listLinks(filters?: { entityType?: string; isActive?: boolean }) {
    return this.repository.findAll(filters);
  }

  public async updateLink(id: string, data: any) {
    return this.repository.update(id, data);
  }

  public async deleteLink(id: string) {
    return this.repository.delete(id);
  }
}
