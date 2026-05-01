import { api } from "./axios";
import type {
  CreateReceiptRequest,
  ExtractReceiptRequest,
  ImageUploadResultDto,
  PaginatedResult,
  ReceiptDto,
  ReceiptExtractionResultDto,
} from "../types/receipt";

export async function getReceiptCategories() {
  const response = await api.get<string[]>("/Receipts/categories");
  return response.data;
}

export async function getReceipts(pageNumber = 1, pageSize = 10) {
  const response = await api.get<PaginatedResult<ReceiptDto>>("/receipts", {
    params: {
      pageNumber,
      pageSize,
    },
  });

  return response.data;
}
export async function getReceiptById(id: string) {
  const response = await api.get<ReceiptDto>(`/receipts/${id}`);
  return response.data;
}

export async function deleteReceipt(id: string): Promise<void> {
  const response = await api.delete(`/receipts/${id}` );

  if (response.status !== 204) {
    throw new Error("Failed to delete receipt.");
  }
}
export async function uploadReceiptImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ImageUploadResultDto>(
    "/receipts/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function extractReceiptData(request: ExtractReceiptRequest) {
  const response = await api.post<ReceiptExtractionResultDto>(
    "/receipts/extract",
    request
  );
  return response.data;
}

export async function createReceipt(request: CreateReceiptRequest) {
  const response = await api.post<string>("/receipts", request);
  return response.data;
}

export async function getRecentReceipts(count = 10) {
  const response = await api.get<ReceiptDto[]>("/Receipts/recent", {
    params: { count },
  });
  return response.data;
}

export async function getReceiptsByCategory(category: string) {
  const response = await api.get<ReceiptDto[]>(
    `/Receipts/category/${category}`,
  );
  return response.data;
}

export async function getReceiptsByDateRange(from: string, to: string) {
  const response = await api.get<ReceiptDto[]>("/Receipts/date-range", {
    params: { from, to },
  });
  return response.data;
}

export async function getReceiptsByDate(date: string) {
  const response = await api.get<ReceiptDto[]>(`/Receipts/by-date/${date}`);
  return response.data;
}

export async function getThisMonthReceipts() {
  const response = await api.get<ReceiptDto[]>("/Receipts/this-month");
  return response.data;
}
