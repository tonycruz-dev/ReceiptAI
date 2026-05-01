// lib/api.ts
// This module provides functions for interacting with the backend API related to receipts.
// It includes functions for fetching receipts, uploading receipt images,
// extracting data from receipts, and creating new receipts.
// The API base URL is defined at the top of the file, and a
// helper function handleResponse is used to process the responses from the API calls.
// Each function makes a fetch request to the appropriate endpoint and returns
// the processed response data or throws an error if the request fails.

import type {
  ExtractReceiptDataResponse,
  PaginatedResult,
  ReceiptDto,
  UploadReceiptImageResponse,
} from "@/types/receipt";

// Define the base URL for the API. This should be updated to match the actual backend URL when deployed.
const API_BASE_URL = "https://cqcrd39c-7095.uks1.devtunnels.ms";

// Helper function to handle API responses. It checks if the response is successful and processes the response data accordingly.
// If the response is not successful, it throws an error with the response text.
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Fetch all receipts from the API and return them as an array of ReceiptDto objects.
// This function makes a GET request to the /api/receipts endpoint
// and processes the response using the handleResponse helper function.
export async function getReceipts(
  pageNumber = 1,
  pageSize = 10,
): Promise<PaginatedResult<ReceiptDto>> {
  const response = await fetch(
    `${API_BASE_URL}/api/receipts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );
  return handleResponse<PaginatedResult<ReceiptDto>>(response);
}

// Fetch a single receipt by ID from the API and return it as a ReceiptDto object.
// This function makes a GET request to the /api/receipts/{id} endpoint
// and processes the response using the handleResponse helper function.
export async function getReceiptById(id: string): Promise<ReceiptDto> {
  const response = await fetch(`${API_BASE_URL}/api/receipts/${id}`);
  return handleResponse<ReceiptDto>(response);
}

// Delete a receipt by ID from the API. This function makes a DELETE request to the /api/receipts/{id} endpoint
// and processes the response using the handleResponse helper function.
// If the request is successful, it returns void; otherwise, it throws an error with the response text.
export async function deleteReceipt(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/receipts/${id}`, {
    method: "DELETE",
  });

  await handleResponse<void>(response);
}

// Upload a receipt image to the API and return the response containing the image URL and public ID.
// This function takes the file URI, file name, and MIME type as parameters, constructs a FormData object,
// and makes a POST request to the /api/receipts/upload-image endpoint.
// The response is processed using the handleResponse helper function, which returns an UploadReceiptImageResponse object.
export async function uploadReceiptImage(
  fileUri: string,
  fileName = "receipt.jpg",
  mimeType = "image/jpeg",
): Promise<UploadReceiptImageResponse> {
  const formData = new FormData();

  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetch(`${API_BASE_URL}/api/receipts/upload-image`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<UploadReceiptImageResponse>(response);
}

// Extract data from a receipt image using the API and return the extracted data as an ExtractReceiptDataResponse object.
// This function takes the image URL as a parameter, constructs a JSON body,
// and makes a POST request to the /api/receipts/extract endpoint.
// The response is processed using the handleResponse
// helper function, which returns an ExtractReceiptDataResponse object containing the extracted data or an error message.
export async function extractReceiptData(input: {
  imageUrl: string;
}): Promise<ExtractReceiptDataResponse> {
  const response = await fetch(`${API_BASE_URL}/api/receipts/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<ExtractReceiptDataResponse>(response);
}

// Create a new receipt in the API using the provided input data and return the ID of the created receipt.
// This function takes an input object containing the receipt details, constructs a JSON body,
// and makes a POST request to the /api/receipts endpoint.
// The response is processed using the handleResponse helper function, which returns the ID of the created receipt as a string.
export async function createReceipt(input: {
  merchantName: string;
  purchaseDate: string;
  totalAmount: number;
  currency: string;
  category: string;
  imageUrl: string;
  imagePublicId: string;
}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/receipts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<string>(response);
}

export async function getReceiptCategories() {
  const response = await fetch(`${API_BASE_URL}/api/receipts/categories`);
  return handleResponse<string[]>(response);
}

export async function getRecentReceipts(count = 10) {
  const response = await fetch(`${API_BASE_URL}/api/receipts/recent?count=${count}`);
  return handleResponse<ReceiptDto[]>(response);
}

export async function getReceiptsByCategory(category: string) {
  const response = await fetch(`${API_BASE_URL}/api/receipts/category/${category}`);
  return handleResponse<ReceiptDto[]>(response);
}

export async function getReceiptsByDateRange(from: string, to: string) {
  const response = await fetch(`${API_BASE_URL}/api/receipts/date-range?from=${from}&to=${to}`);
  return handleResponse<ReceiptDto[]>(response);  
}

export async function getReceiptsByDate(date: string) {
  const response = await fetch(`${API_BASE_URL}/api/receipts/by-date/${date}`);
  return handleResponse<ReceiptDto[]>(response);
}

export async function getThisMonthReceipts() {
  const response = await fetch(`${API_BASE_URL}/api/receipts/this-month`);
  return handleResponse<ReceiptDto[]>(response);
}