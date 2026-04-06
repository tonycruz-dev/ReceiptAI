export interface ReceiptDto {
  id: string;
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
}

export interface ImageUploadResultDto {
  publicId: string | null;
  url: string | null;
  errorMessage: string | null;
}

export interface ExtractReceiptRequest {
  imageUrl: string;
}

export interface ReceiptExtractionResultDto {
  merchantName: string | null;
  purchaseDate: string | null;
  totalAmount: number | null;
  currency: string | null;
  category: string | null;
  rawText: string | null;
  errorMessage: string | null;
}

export interface CreateReceiptRequest {
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
}
