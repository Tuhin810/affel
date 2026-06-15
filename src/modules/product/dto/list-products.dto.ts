export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "cashback_desc"
  | "featured";

export interface ListProductsDto {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
