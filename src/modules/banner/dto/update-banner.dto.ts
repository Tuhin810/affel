export interface UpdateBannerDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  tags?: string[];
  offerTitle?: string;
  link?: string;
  placement?: string;
  isActive?: boolean;
}
