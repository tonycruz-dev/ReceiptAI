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