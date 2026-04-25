using ReceiptAI.Application.DTOs;
using ReceiptAI.Application.Interfaces;

namespace ReceiptAI.IntegrationTests;

public class FakeReceiptExtractionService : IReceiptExtractionService
{
	public Task<ReceiptExtractionResultDto> ExtractReceiptAsync(string imageUrl, CancellationToken cancellationToken = default)
	{
		return Task.FromResult(new ReceiptExtractionResultDto
		{
			MerchantName = "Mock Store",
			PurchaseDate = new DateTime(2025, 1, 10),
			TotalAmount = 12.99m,
			Currency = "GBP",
			Category = "Groceries",
			RawText = "Mock receipt text",
			ErrorMessage = null
		});
	}
}
