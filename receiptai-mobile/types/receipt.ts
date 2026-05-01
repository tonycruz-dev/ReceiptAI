export type ReceiptDto = {
  id: string;
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  category: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  createdAt: string;
};

export type UploadReceiptImageResponse = {
  url?: string;
  publicId?: string;
  errorMessage?: string;
};

export type ExtractReceiptDataResponse = {
  merchantName?: string;
  purchaseDate?: string;
  totalAmount?: number | null;
  currency?: string;
  category?: string;
  errorMessage?: string;
};

export interface CreateReceiptRequest {
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
}

export type PaginatedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type FilterOption =
  | "all"
  | "recent"
  | "category"
  | "date-range"
  | "by-date"
  | "this-month";

export const filterOptions: [FilterOption, string][] = [
  ["all", "All"],
  ["recent", "Recent"],
  ["category", "Category"],
  ["date-range", "Range"],
  ["by-date", "Date"],
  ["this-month", "This month"],
];