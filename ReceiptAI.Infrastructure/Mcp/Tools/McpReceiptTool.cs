using ModelContextProtocol.Server;
using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;
using System.ComponentModel;

namespace ReceiptAI.Infrastructure.Mcp.Tools;

[McpServerToolType]
public class McpReceiptTool(
IReceiptRepository receiptRepository, 
IReceiptAiService _receiptAiService) 
{

	[McpServerTool(UseStructuredContent = true, Name = "create_receipt_from_image")]
	[Description("Extract receipt information from an image URL and create a new receipt.")]
	public async Task<ResponseReceiptDto> CreateReceiptFromImageAsync(
	ExtractReceiptRequest request,
	CancellationToken ct = default)
	{
		if (string.IsNullOrWhiteSpace(request.ImageUrl))
		{
			throw new ArgumentException("ImageUrl is required.");
		}

		var extraction = await _receiptAiService.ExtractReceiptAsync(request.ImageUrl, ct);

		if (!string.IsNullOrWhiteSpace(extraction.ErrorMessage))
		{
			throw new Exception(extraction.ErrorMessage);
		}

		var receipt = new Receipt
		{
			Id = Guid.NewGuid(),
			MerchantName = extraction.MerchantName ?? string.Empty,
			PurchaseDate = (extraction.PurchaseDate ?? DateTime.MinValue),
			TotalAmount = (extraction.TotalAmount ?? 0),
			Currency = extraction.Currency ?? string.Empty,
			Category = extraction.Category ?? string.Empty,
			ImageUrl = request.ImageUrl,
			ImagePublicId = ExtractPublicId(request.ImageUrl),
			CreatedAt = DateTime.UtcNow
		};

		await receiptRepository.AddAsync(receipt, ct);

		return receipt.ToDto();

	}

	[McpServerTool(UseStructuredContent = true, Name = "create_receipt")]
	[Description("Create a new receipt.")]
	public async Task<ResponseReceiptDto> CreateReceiptAsync(CreateReceiptRequest request, CancellationToken ct = default)
	{
		var receipt = new Receipt
		{
			Id = Guid.NewGuid(),
			MerchantName = request.MerchantName,
			PurchaseDate = request.PurchaseDate,
			TotalAmount = request.TotalAmount,
			Currency = request.Currency,
			Category = request.Category,
			ImageUrl = request.ImageUrl,
			ImagePublicId = ExtractPublicId(request.ImageUrl),
			CreatedAt = DateTime.UtcNow
		};

		await receiptRepository.AddAsync(receipt, ct);

		return receipt.ToDto();
	}

	[McpServerTool(UseStructuredContent = true,	ReadOnly = true, Name = "get_all_receipts")]
	[Description("Retrieve all receipts.")]
	public async Task<List<ResponseReceiptDto>> GetAllReceiptsAsync(CancellationToken ct = default)
	{
		var receipts = await receiptRepository.GetAllAsync(ct);

		return [.. receipts.Select(r => new ResponseReceiptDto
		{
			Id = r.Id,
			MerchantName = r.MerchantName,
			PurchaseDate = r.PurchaseDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
			TotalAmount = r.TotalAmount,
			Currency = r.Currency,
			Category = r.Category,
			ImageUrl = r.ImageUrl,
		})];
	}

	[McpServerTool(UseStructuredContent = true,	ReadOnly = true, Name = "get_receipt_by_id")]
	[Description("Retrieve a receipt by its unique ID.")]
	public async Task<ResponseReceiptDto?> GetReceiptByIdAsync(
	Guid id,
	CancellationToken ct = default)
	{
		var receipt = await receiptRepository.GetByIdAsync(id, ct);

		if (receipt is null)
		{
			return null;
		}
		return receipt.ToDto();

	}

	[McpServerTool(UseStructuredContent = true,	ReadOnly = true, Name = "extract_receipt")]
	[Description("Extract receipt information from an uploaded receipt image URL.")]
	public async Task<ReceiptExtractionResultDto> ExtractReceiptAsync(ExtractReceiptRequest request,
	CancellationToken ct = default)
	{
		if (string.IsNullOrWhiteSpace(request.ImageUrl))
		{
			throw new ArgumentException("ImageUrl is required.");
		}

		var result = await _receiptAiService.ExtractReceiptAsync(
			request.ImageUrl,
			ct);

		if (!string.IsNullOrWhiteSpace(result.ErrorMessage))
		{
			throw new Exception(result.ErrorMessage);
		}

		return result;
	}

	[McpServerTool(UseStructuredContent = true,	ReadOnly = false, Name = "delete_receipt")]
	[Description("Delete a receipt by ID and remove its image from storage if available.")]
	public async Task<string> DeleteReceiptAsync(
	Guid id,
	CancellationToken ct = default)
	{
		var receipt = await receiptRepository.GetByIdAsync(id, ct);

		if (receipt is null)
		{
			throw new Exception($"Receipt with ID {id} was not found.");
		}

		await receiptRepository.DeleteAsync(receipt, ct);

		return "Receipt deleted successfully.";
	}

	private static string ExtractPublicId(string imageUrl)
	{
		if (string.IsNullOrWhiteSpace(imageUrl))
			return string.Empty;

		var uri = new Uri(imageUrl);
		var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

		var uploadIndex = Array.IndexOf(segments, "upload");
		if (uploadIndex == -1 || uploadIndex + 1 >= segments.Length)
			return string.Empty;

		var relevantSegments = segments.Skip(uploadIndex + 1).ToList();

		if (relevantSegments[0].StartsWith("v"))
			relevantSegments.RemoveAt(0);

		var path = string.Join("/", relevantSegments);

		var lastDot = path.LastIndexOf('.');
		if (lastDot != -1)
			path = path.Substring(0, lastDot);

		return path;
	}
}
