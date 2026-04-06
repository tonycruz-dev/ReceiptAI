import { api } from "./axios";
import type {
  CreateReceiptRequest,
  ExtractReceiptRequest,
  ImageUploadResultDto,
  ReceiptDto,
  ReceiptExtractionResultDto,
} from "../types/receipt";

export async function getReceipts() {
  const response = await api.get<ReceiptDto[]>("/receipts");
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
