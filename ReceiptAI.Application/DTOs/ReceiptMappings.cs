using ReceiptAI.Domain.Entities;

namespace ReceiptAI.Application.DTOs;

public static class ReceiptMappings
{
	public static ResponseReceiptDto ToDto(this Receipt receipt)
	{
		return new ResponseReceiptDto
		{
			Id = receipt.Id,
			MerchantName = receipt.MerchantName,
			PurchaseDate = receipt.PurchaseDate.ToString("yyyy-MM-ddTHH:mm:ssZ"),
			TotalAmount = receipt.TotalAmount,
			Currency = receipt.Currency,
			Category = receipt.Category,
			ImageUrl = receipt.ImageUrl
		};
	}
}
