using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.DTOs;

public static class ReceiptMappings
{
	public static ReceiptDto ToDto(this Receipt receipt)
	{
		return new ReceiptDto
		{
			Id = receipt.Id,
			MerchantName = receipt.MerchantName,
			PurchaseDate = receipt.PurchaseDate,
			TotalAmount = receipt.TotalAmount,
			Currency = receipt.Currency,
			Category = receipt.Category,
			ImageUrl = receipt.ImageUrl,
			CreatedAt = receipt.CreatedAt
		};
	}
}