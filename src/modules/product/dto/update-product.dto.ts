import { ProductAffiliateLinkDto } from "./create-product.dto";

export interface UpdateProductDto {
  name?: string;
  description?: string;
  categoryIds?: string[];
  imageUrls?: string[]; // Wait, let's make sure we don't introduce typos
  imagePublicIds?: string[];
  price?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  cashbackPercentage?: number;
  cashbackTerms?: string;
  trackingTime?: number;
  validationTime?: number;
  paymentRelease?: number;
  affiliateLinks?: ProductAffiliateLinkDto[];
}
