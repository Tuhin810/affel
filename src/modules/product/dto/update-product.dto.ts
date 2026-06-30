export interface UpdateProductDto {
  name?: string;
  description?: string;
  categoryIds?: string[];
  imageUrls?: string[];
  imagePublicIds?: string[];
  price?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  cashbackPercentage?: number;
  cashbackTerms?: string;
  trackingTime?: number;
  validationTime?: number;
  paymentRelease?: number;
  affiliateLinks?: Array<{
    platformName: string;
    affiliateLink: string;
    mrp: number;
    sellPrice: number;
    cashbackPercentage: number;
  }>;
}
