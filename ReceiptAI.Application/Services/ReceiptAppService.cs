using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;
using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.Services;

public class ReceiptAppService(IReceiptRepository receiptRepository) : IReceiptAppService
{
	private readonly IReceiptRepository _receiptRepository = receiptRepository;
	public async Task<Guid> CreateReceiptAsync(CreateReceiptForApiRequest request, CancellationToken cancellationToken = default)
	{
		var receipt = new Receipt(
		   request.MerchantName,
		   request.PurchaseDate,
		   request.TotalAmount,
		   request.ImageUrl,
		   request.ImagePublicId,
		   request.Currency,
		   request.Category);

		await _receiptRepository.AddAsync(receipt, cancellationToken);
		return receipt.Id;
	}

	public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
	{
		var itemToDelete = await _receiptRepository.GetByIdAsync(id, cancellationToken)
			?? throw new KeyNotFoundException("Receipt not found.");

		await _receiptRepository.DeleteAsync(itemToDelete, cancellationToken);
	}

	public async Task<List<ResponseReceiptDto>> GetAllAsync(CancellationToken cancellationToken = default)
	{
		var result = await _receiptRepository.GetAllAsync(cancellationToken);
		return [.. result.Select(MapToDto)];
	}

	public async Task<ResponseReceiptDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
	{
		var receipt = await _receiptRepository.GetByIdAsync(id, cancellationToken);
		if (receipt == null)
			return null;

        return MapToDto(receipt);

	}

	public async Task<List<ResponseReceiptDto>> GetReceiptsByCategoryAsync(string category, CancellationToken cancellationToken = default)
	{
		var receipts = await _receiptRepository.GetReceiptsByCategoryAsync(category, cancellationToken);
		return [.. receipts.Select(MapToDto)];
	}

	public async Task<List<ResponseReceiptDto>> GetReceiptsByDateAsync(DateTime date, CancellationToken cancellationToken = default)
	{
		var receipts = await _receiptRepository.GetReceiptsByDateAsync(date, cancellationToken);
		return [.. receipts.Select(MapToDto)];
	}

	public async Task<List<ResponseReceiptDto>> GetReceiptsByDateRangeAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
	{
		var receipts = await _receiptRepository.GetReceiptsByDateRangeAsync(from, to, cancellationToken);
		return [.. receipts.Select(MapToDto)];
	}

	public async Task<ReceiptSummaryDto> GetReceiptSummaryAsync(CancellationToken cancellationToken = default)
	{
		var summary = await _receiptRepository.GetReceiptSummaryAsync(cancellationToken);
		return summary;
	}

	public async Task<List<ResponseReceiptDto>> GetRecentReceiptsAsync(int count, CancellationToken cancellationToken = default)
	{
		var receipts = await _receiptRepository.GetRecentReceiptsAsync(count, cancellationToken);
		return [.. receipts.Select(MapToDto)];
	}

	public async Task<List<ResponseReceiptDto>> GetThisMonthReceiptsAsync(DateTime date, CancellationToken cancellationToken = default)
	{
		var receipts = await _receiptRepository.GetThisMonthReceiptsAsync(date, cancellationToken);
		return [.. receipts.Select(MapToDto)];
	}

	private static ResponseReceiptDto MapToDto(Receipt receipt)
	{
		return new ResponseReceiptDto
		{
			Id = receipt.Id,
			MerchantName = receipt.MerchantName,
			PurchaseDate = receipt.PurchaseDate.ToString("yyyy-MM-dd"),
			TotalAmount = receipt.TotalAmount,
			Currency = receipt.Currency,
			Category = receipt.Category,
			ImageUrl = receipt.ImageUrl
		};
	}
}
