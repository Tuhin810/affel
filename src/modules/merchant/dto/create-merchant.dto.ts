export interface CreateMerchantDto {
  name: string;
  slug: string;
  description?: string;
  websiteUrl?: string;
  affiliateUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  cashbackText?: string;
  termsAndConditions?: string;
  isFeatured?: boolean;
}